import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { BetaBaeClone } from '@prisma/client';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { RedisService } from 'src/infra/redis/redis.service';
import { CHOSEN_LLM_MODEL } from 'src/modules/llm/constants/config';
import {
  BETABAE_CREATION_PROMPT,
  BETABAE_RESPONSE_PROMPT,
  REALBAE_THOUGHT_ROMPT,
} from 'src/modules/llm/constants/prompt';
import {
  BetaBaeCreateRequestDto,
  BetaBaeUpdateRequestDto,
} from 'src/modules/llm/dto/betabae-clone.dto';
import {
  RealBaeThoughtRequestDto,
  RealBaeThoughtResponseDto,
} from 'src/modules/llm/dto/realbae-thought.dto';
import { LLMModel } from 'src/modules/llm/enums/llm.enums';
import { ClaudeProvider } from 'src/modules/llm/providers/claude.provider';
import { DeepSeekProvider } from 'src/modules/llm/providers/deepseek.provider';
import { GeminiProvider } from 'src/modules/llm/providers/gemini.provider';
import {
  LLMMessageContext,
  LLMProviderBaseService,
  LoveLanguageContext,
  PersonalityContext,
  UserContext,
} from 'src/modules/llm/providers/llm-provider-base.service';
import { OpenAIProvider } from 'src/modules/llm/providers/openai.provider';

export interface MessageRequestContext {
  role: 'user' | 'partner';
  content: string;
}

export interface BetaBaeMessageRequest {
  messages: MessageRequestContext[];
  partnerId: number;
}

@Injectable()
export class LlmCloneService {
  private readonly llmProvider: LLMProviderBaseService;
  private readonly logger = new Logger(LlmCloneService.name);
  constructor(
    private prisma: PrismaService,
    private readonly openAIProvider: OpenAIProvider,
    private readonly claudeProvider: ClaudeProvider,
    private readonly geminiProvider: GeminiProvider,
    private readonly deepSeekProvider: DeepSeekProvider,
    private readonly redisService: RedisService,
  ) {
    switch (CHOSEN_LLM_MODEL) {
      case LLMModel.OPEN_AI:
        this.llmProvider = this.openAIProvider;
        break;
      case LLMModel.CLAUDE:
        this.llmProvider = this.claudeProvider;
        break;
      case LLMModel.GEMINI:
        this.llmProvider = this.geminiProvider;
        break;
      case LLMModel.DEEPSEEK:
        this.llmProvider = this.deepSeekProvider;
        break;
    }
  }

  private async getSummary(
    userId: number,
    sampleUserResponses: string[],
    currentSummary?: string,
  ): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        personality: true,
        loveLanguage: true,
      },
    });

    if (!user || !user.profile || !user.personality || !user.loveLanguage) {
      throw new BadRequestException('Incomplete user data to create BetaBae');
    }

    const userContext: UserContext = {
      name: user.profile.nickname,
      birthday: user.profile.birthday.toISOString().split('T')[0],
      gender: user.profile.gender,
      city: user.profile.city,
      interests: user.profile.interests,
      mbti: user.profile.mbti ?? undefined,
    };

    const personalityContext: PersonalityContext = {
      openness: user.personality.openness,
      conscientiousness: user.personality.conscientiousness,
      extraversion: user.personality.extraversion,
      agreeableness: user.personality.agreeableness,
      neuroticism: user.personality.neuroticism,
    };

    const loveLanguageContext: LoveLanguageContext = {
      wordsOfAffirmation: user.loveLanguage.words_of_affirmation,
      actsOfService: user.loveLanguage.acts_of_service,
      receivingGifts: user.loveLanguage.receiving_gifts,
      qualityTime: user.loveLanguage.quality_time,
      physicalTouch: user.loveLanguage.physical_touch,
    };

    const prompt = BETABAE_CREATION_PROMPT(
      sampleUserResponses,
      personalityContext,
      loveLanguageContext,
      userContext,
      currentSummary ?? null,
    );

    const summary = await this.llmProvider.getLLMResponse([
      {
        role: 'system',
        content: prompt,
      },
      {
        role: 'user',
        content:
          'Provide a comprehensive and detailed summary of the user based on the above information.',
      },
    ]);

    return summary;
  }

  async createBetaBae(userId: number, { sampleUserResponses }: BetaBaeCreateRequestDto) {
    const betaClone: BetaBaeClone | null = await this.prisma.betaBaeClone.findUnique({
      where: { user_id: userId },
    });

    if (betaClone) {
      throw new BadRequestException('Beta clone already exists for this user');
    }

    await this.prisma.betaBaeClone.create({
      data: {
        user_id: userId,
        user_context: await this.getSummary(userId, sampleUserResponses),
      },
    });

    this.logger.log(`Betabae clone created`);

    return;
  }

  async deleteBetaBae(userId: number) {
    const betaBaeClone: BetaBaeClone | null = await this.prisma.betaBaeClone.findUnique({
      where: { user_id: userId },
    });

    if (!betaBaeClone) {
      throw new BadRequestException('Beta clone does not exist for this user');
    }

    await this.prisma.betaBaeClone.delete({
      where: { user_id: userId },
    });

    return;
  }

  async updateBetaBae(userId: number, { sampleUserResponses }: BetaBaeUpdateRequestDto) {
    const betaBaeClone: BetaBaeClone | null = await this.prisma.betaBaeClone.findUnique({
      where: { user_id: userId },
    });

    if (!betaBaeClone) {
      throw new BadRequestException('Beta clone does not exist for this user');
    }

    const currentSummary = await this.prisma.betaBaeClone.findFirst({
      where: { user_id: userId },
      select: { user_context: true },
    });

    await this.prisma.betaBaeClone.update({
      where: { user_id: userId },
      data: {
        user_context: await this.getSummary(
          userId,
          sampleUserResponses,
          currentSummary?.user_context,
        ),
      },
    });

    this.logger.log(`Betabae clone updated for user ${userId}`);

    return;
  }

  async getBetaBaeResponse(
    userId: number,
    { partnerId, messages }: BetaBaeMessageRequest,
  ): Promise<string> {
    const partnerClone = await this.prisma.betaBaeClone.findUnique({
      where: { user_id: partnerId },
    });

    if (!partnerClone) {
      throw new BadRequestException('Beta clone does not exist for this user');
    }

    // Convert to LLM format
    const llmMessages: LLMMessageContext[] = messages.map((msg) => ({
      role: msg.role === 'partner' ? 'assistant' : 'user',
      content: msg.content,
    }));

    const systemPrompt: LLMMessageContext = {
      role: 'system',
      content: BETABAE_RESPONSE_PROMPT(partnerClone.user_context, ''),
    };

    const response = await this.llmProvider.getLLMResponse([systemPrompt, ...llmMessages]);

    this.logger.log(`Beta Bae response generated for user ${userId}: ${response}`);

    return response;
  }

  async getRealBaeThoughtResponse(
    userId: number,
    { chatId, messageText }: RealBaeThoughtRequestDto,
  ): Promise<RealBaeThoughtResponseDto> {
    const convo = await this.prisma.conversation.findUnique({
      where: { id: chatId },
      select: { match_id: true },
    });

    if (!convo) {
      throw new BadRequestException('Match not found for this chat');
    }

    const match = await this.prisma.match.findUnique({
      where: { id: convo.match_id },
      include: {
        requester: {
          include: {
            profile: true,
            loveLanguage: true,
            personality: true,
          },
        },
        requested: {
          include: {
            profile: true,
            loveLanguage: true,
            personality: true,
          },
        },
      },
    });

    if (!match) throw new BadRequestException('Match not found');

    const isUserRequester = match.requester_id === userId;
    const user = isUserRequester ? match.requester : match.requested;
    const partner = isUserRequester ? match.requested : match.requester;

    if (
      !user.profile ||
      !user.loveLanguage ||
      !user.personality ||
      !partner.profile ||
      !partner.loveLanguage ||
      !partner.personality
    ) {
      console.log('user profile:', user.profile);
      console.log('partner profile:', partner.profile);
      console.log('user love language:', user.loveLanguage);
      console.log('partner love language:', partner.loveLanguage);
      console.log('user personality:', user.personality);
      console.log('partner personality:', partner.personality);

      throw new BadRequestException('Incomplete user or match data');
    }

    const userContext: UserContext = {
      name: user.profile.nickname,
      birthday: user.profile.birthday.toISOString().split('T')[0],
      gender: user.profile.gender,
      city: user.profile.city,
      interests: user.profile.interests,
      mbti: user.profile.mbti ?? undefined,
    };

    const partnerContext: UserContext = {
      name: partner.profile.nickname,
      birthday: partner.profile.birthday.toISOString().split('T')[0],
      gender: partner.profile.gender,
      city: partner.profile.city,
      interests: partner.profile.interests,
      mbti: partner.profile.mbti ?? undefined,
    };

    const userPersonality: PersonalityContext = {
      openness: user.personality.openness,
      conscientiousness: user.personality.conscientiousness,
      extraversion: user.personality.extraversion,
      agreeableness: user.personality.agreeableness,
      neuroticism: user.personality.neuroticism,
    };

    const partnerPersonality: PersonalityContext = {
      openness: partner.personality.openness,
      conscientiousness: partner.personality.conscientiousness,
      extraversion: partner.personality.extraversion,
      agreeableness: partner.personality.agreeableness,
      neuroticism: partner.personality.neuroticism,
    };

    const userLoveLanguage: LoveLanguageContext = {
      wordsOfAffirmation: user.loveLanguage.words_of_affirmation,
      actsOfService: user.loveLanguage.acts_of_service,
      receivingGifts: user.loveLanguage.receiving_gifts,
      qualityTime: user.loveLanguage.quality_time,
      physicalTouch: user.loveLanguage.physical_touch,
    };

    const partnerLoveLanguage: LoveLanguageContext = {
      wordsOfAffirmation: partner.loveLanguage.words_of_affirmation,
      actsOfService: partner.loveLanguage.acts_of_service,
      receivingGifts: partner.loveLanguage.receiving_gifts,
      qualityTime: partner.loveLanguage.quality_time,
      physicalTouch: partner.loveLanguage.physical_touch,
    };

    const redisKey = `messages:${chatId}`;
    const raw = await this.redisService.get(redisKey);

    if (!raw) {
      throw new BadRequestException('No conversation info found in Redis');
    }

    const conversationInfo: {
      partnerId: number;
      messages: { sender_id: number; message_text: string }[];
    } = JSON.parse(raw || '{}');

    if (!conversationInfo?.messages || !conversationInfo.partnerId) {
      throw new BadRequestException('Conversation info missing or malformed');
    }
    const contextMessages: string[] = conversationInfo.messages
      .filter((msg) => msg.message_text.trim() !== '')
      .map((msg) => {
        const role = msg.sender_id === userId ? 'user' : 'partner';
        return `${role}: ${msg.message_text}`;
      });

    console.log('contextMessages:', contextMessages);

    const prompt = REALBAE_THOUGHT_ROMPT(
      contextMessages,
      messageText,
      userContext,
      userPersonality,
      userLoveLanguage,
      partnerContext,
      partnerPersonality,
      partnerLoveLanguage,
    );

    const rawResponse = await this.llmProvider.getLLMResponse([
      { role: 'system', content: prompt },
    ]);

    let response: { analysis: string; suggestions: string };

    try {
      response = JSON.parse(rawResponse) as {
        analysis: string;
        suggestions: string;
      };
    } catch (err) {
      this.logger.error(`Failed to parse LLM response: ${rawResponse}`);
      throw new InternalServerErrorException('Invalid LLM response format', String(err));
    }

    this.logger.log(`Real Bae thought analysis generated for user ${userId}: ${response.analysis}`);

    this.logger.log(
      `Real Bae thought suggestions generated for user ${userId}: ${response.suggestions}`,
    );

    return new RealBaeThoughtResponseDto(response.analysis, response.suggestions);
  }

  async getTestRealBaeThoughtResponse(
    message: string,
    userId: number,
    contextMessages: string,
    matchId: number,
  ): Promise<string> {
    const match = await this.prisma.match.findUnique({
      where: { id: matchId },
      include: {
        requester: {
          include: {
            profile: true,
            loveLanguage: true,
            personality: true,
          },
        },
        requested: {
          include: {
            profile: true,
            loveLanguage: true,
            personality: true,
          },
        },
      },
    });

    if (!match) throw new BadRequestException('Match not found');

    const isUserRequester = match.requester_id === userId;
    const user = isUserRequester ? match.requester : match.requested;
    const partner = isUserRequester ? match.requested : match.requester;

    if (
      !user.profile ||
      !user.loveLanguage ||
      !user.personality ||
      !partner.profile ||
      !partner.loveLanguage ||
      !partner.personality
    ) {
      console.log('user profile:', user.profile);
      console.log('partner profile:', partner.profile);
      console.log('user love language:', user.loveLanguage);
      console.log('partner love language:', partner.loveLanguage);
      console.log('user personality:', user.personality);
      console.log('partner personality:', partner.personality);

      throw new BadRequestException('Incomplete user or match data');
    }

    const userContext: UserContext = {
      name: user.profile.nickname,
      birthday: user.profile.birthday.toISOString().split('T')[0],
      gender: user.profile.gender,
      city: user.profile.city,
      interests: user.profile.interests,
      mbti: user.profile.mbti ?? undefined,
    };

    const partnerContext: UserContext = {
      name: partner.profile.nickname,
      birthday: partner.profile.birthday.toISOString().split('T')[0],
      gender: partner.profile.gender,
      city: partner.profile.city,
      interests: partner.profile.interests,
      mbti: partner.profile.mbti ?? undefined,
    };

    const userPersonality: PersonalityContext = {
      openness: user.personality.openness,
      conscientiousness: user.personality.conscientiousness,
      extraversion: user.personality.extraversion,
      agreeableness: user.personality.agreeableness,
      neuroticism: user.personality.neuroticism,
    };

    const partnerPersonality: PersonalityContext = {
      openness: partner.personality.openness,
      conscientiousness: partner.personality.conscientiousness,
      extraversion: partner.personality.extraversion,
      agreeableness: partner.personality.agreeableness,
      neuroticism: partner.personality.neuroticism,
    };

    const userLoveLanguage: LoveLanguageContext = {
      wordsOfAffirmation: user.loveLanguage.words_of_affirmation,
      actsOfService: user.loveLanguage.acts_of_service,
      receivingGifts: user.loveLanguage.receiving_gifts,
      qualityTime: user.loveLanguage.quality_time,
      physicalTouch: user.loveLanguage.physical_touch,
    };

    const partnerLoveLanguage: LoveLanguageContext = {
      wordsOfAffirmation: partner.loveLanguage.words_of_affirmation,
      actsOfService: partner.loveLanguage.acts_of_service,
      receivingGifts: partner.loveLanguage.receiving_gifts,
      qualityTime: partner.loveLanguage.quality_time,
      physicalTouch: partner.loveLanguage.physical_touch,
    };

    const prompt = REALBAE_THOUGHT_ROMPT(
      contextMessages.split('\n'),
      message,
      userContext,
      userPersonality,
      userLoveLanguage,
      partnerContext,
      partnerPersonality,
      partnerLoveLanguage,
    );

    const response = await this.llmProvider.getLLMResponse([
      { role: 'system', content: prompt },
      { role: 'user', content: message },
    ]);

    this.logger.log(`Real Bae thought response generated for user ${userId}: ${response}`);

    return response;
  }
}
