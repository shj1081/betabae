import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import {
  LLMProviderBaseService,
  LLMMessageContext,
} from 'src/modules/llm/providers/llm-provider-base.service';

enum DeepSeekModel {
  CHAT = 'deepseek-chat',
  CODER = 'deepseek-coder',
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
  private readonly model = DeepSeekModel.CHAT;
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

      const content = response.data?.choices?.[0]?.message?.content?.trim();
      return content ?? '';
    } catch (error) {
      console.error('DeepSeek API error:', error);
      throw new InternalServerErrorException('Failed to get response from DeepSeek');
    }
  }
}
