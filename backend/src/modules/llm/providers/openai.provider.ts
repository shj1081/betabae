import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';
import { LLM_TEMPERATURE } from 'src/modules/llm/constants/param';
import {
  LLMMessageContext,
  LLMProviderBaseService,
} from 'src/modules/llm/providers/llm-provider-base.service';
import { extractJsonFromCodeFence } from 'src/modules/llm/utils/utils';

enum OpenAIModel {
  GPT_3_5_TURBO = 'gpt-3.5-turbo',
  GPT_4 = 'gpt-4',
  GPT_4O = 'gpt-4o',
}

@Injectable()
export class OpenAIProvider extends LLMProviderBaseService {
  private readonly openai: OpenAI;

  constructor() {
    super();

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async getLLMResponse(messages: LLMMessageContext[]): Promise<string> {
    try {
      const chatCompletion = await this.openai.chat.completions.create({
        model: OpenAIModel.GPT_4O,
        messages: messages,
        temperature: LLM_TEMPERATURE,
      });

      const message = chatCompletion.choices[0]?.message?.content ?? '';

      console.log('OpenAI API response:', message);

      return extractJsonFromCodeFence(message.trim());
    } catch (error) {
      console.error('OpenAI API error:', error);

      // if (
      //   error?.status === 429 &&
      //   (error?.code === 'insufficient_quota' || error?.error?.code === 'insufficient_quota')
      // ) {
      //   throw new InternalServerErrorException(
      //     'You have exceeded your OpenAI quota. Please check your billing settings or try again later.',
      //   );
      // }
      throw new InternalServerErrorException('Failed to get response from OpenAI');
    }
  }
}
