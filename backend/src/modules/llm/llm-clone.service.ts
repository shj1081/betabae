import { BadRequestException, Injectable } from '@nestjs/common';
import { BetaBaeClone } from '@prisma/client';
import { PrismaService } from 'src/infra/prisma/prisma.service';
import { CHOSEN_LLM_MODEL } from 'src/modules/llm/constants/config';
import { BETABAE_CREATION_PROMPT } from 'src/modules/llm/constants/prompt';
import {
  BetaBaeCreateRequestDto,
  BetaBaeUpdateRequestDto,
} from 'src/modules/llm/dto/betabae-clone.dto';
import { LLMModel } from 'src/modules/llm/enums/llm.enums';
import {
  LLMProviderBaseService,
  LoveLanguageContext,
  PersonalityContext,
  UserContext,
} from 'src/modules/llm/providers/llm-provider-base.service';
import { OpenAIProvider } from 'src/modules/llm/providers/openai.provider';

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

  /**
   * Get answer from LLM for a user message
   * @param userMessage The message from the user
   * @returns The bot's response message
   */
  async getBotResponse(userMessage: string): Promise<string> {
    // Get response from LLM
    return await this.getAnswerFromBot(userMessage);
  }

  /**
   * Get answer from LLM
   * @param userMessage The message from the user
   * @returns The bot's response
   */
  async getAnswerFromBot(userMessage: string): Promise<string> {
    // todo: Implement the logic to get the answer from the LLM; added this for lint
    await this.prisma.betaBaeClone.findFirst({
      where: { user_context: { contains: userMessage } },
    });

    const response = {
      choices: [
        {
          message: {
            content: `This is a mock response from the LLM to ${userMessage}.`,
          },
        },
      ],
    };
    return response.choices[0]?.message?.content || '죄송합니다. 답변을 찾을 수 없습니다.';
  }
}
