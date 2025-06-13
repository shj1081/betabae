import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import console from 'console';
import {
  LLMProviderBaseService,
  LLMMessageContext,
} from 'src/modules/llm/providers/llm-provider-base.service';
import { extractJsonFromCodeFence } from 'src/modules/llm/utils/utils';

enum DeepSeekModel {
  R1 = 'deepseek-ai/DeepSeek-R1',
  V3 = 'deepseek-ai/DeepSeek-V3',
}

interface DeepSeekRequest {
  model: DeepSeekModel;
  messages: LLMMessageContext[];
  temperature: number;
  max_tokens?: number;
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

@Injectable()
export class DeepSeekProvider extends LLMProviderBaseService {
  private readonly endpoint = 'https://api.together.xyz/v1/chat/completions';
  private readonly model = DeepSeekModel.V3;
  private readonly temperature = 0.7;
  private readonly maxTokens = 1024;

  async getLLMResponse(messages: LLMMessageContext[]): Promise<string> {
    try {
      const apiKey = process.env.TOGETHER_API_KEY;
      if (!apiKey) {
        throw new Error('TOGETHER_API_KEY is not defined in environment variables');
      }

      const requestBody: DeepSeekRequest = {
        model: this.model,
        messages,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
      };

      const response: AxiosResponse<DeepSeekResponse> = await axios.post(
        this.endpoint,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      // const content = response.data?.choices?.[0]?.message?.content?.trim();
      const raw = response.data?.choices?.[0]?.message?.content?.trim();

      if (!raw) return '';

      console.log('DeepSeek response:', raw);

      try {
        return extractJsonFromCodeFence(raw) || '';
      } catch {
        console.error('Failed to parse JSON from DeepSeek response:', raw);
        return '';
      }

      // return content ?? '';
    } catch (error) {
      console.error('DeepSeek API error:', error?.response?.data || error.message);
      throw new InternalServerErrorException('Failed to get response from DeepSeek');
    }
  }
}
