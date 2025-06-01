import { BadRequestException, Injectable } from '@nestjs/common';
import { BetaBaeClone } from '@prisma/client';
import { PrismaService } from 'src/infra/prisma/prisma.service';
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
import { LLMModel } from 'src/modules/llm/enums/llm.enums';
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
  constructor(
    private prisma: PrismaService,
    private readonly openAIProvider: OpenAIProvider,
  ) {
    switch (CHOSEN_LLM_MODEL) {
      case LLMModel.OPEN_AI:
        this.llmProvider = this.openAIProvider;
        break;
      // todo: Add other LLM providers here
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

    return response;
  }

  async getRealBaeThoughtResponse(
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

    console.log('Match found:', match);

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

    return response;
  }
}
