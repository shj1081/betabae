import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import {
  LLMProviderBaseService,
  LLMMessageContext,
} from 'src/modules/llm/providers/llm-provider-base.service';
import { extractJsonFromCodeFence } from 'src/modules/llm/utils/utils';

enum ClaudeModel {
  CLAUDE_3_OPUS = 'claude-3-opus-20240229',
  CLAUDE_3_SONNET = 'claude-3-sonnet-20240229',
  CLAUDE_3_HAIKU = 'claude-3-haiku-20240307',
}

type ClaudeRole = 'user' | 'assistant';

interface ClaudeMessage {
  role: ClaudeRole;
  content: string;
}

interface ClaudeRequestBody {
  model: ClaudeModel;
  messages: ClaudeMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface ClaudeResponse {
  content: Array<{
    text: string;
  }>;
}

@Injectable()
export class ClaudeProvider extends LLMProviderBaseService {
  private readonly endpoint = 'https://api.anthropic.com/v1/messages';
  private readonly model = ClaudeModel.CLAUDE_3_OPUS;
  private readonly temperature = 0.7;
  private readonly maxTokens = 1024;

  async getLLMResponse(messages: LLMMessageContext[]): Promise<string> {
    try {
      const apiKey = process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        throw new Error('ANTHROPIC_API_KEY is not defined in environment variables');
      }

      const formattedMessages: ClaudeMessage[] = messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      }));

      const requestBody: ClaudeRequestBody = {
        model: this.model,
        messages: formattedMessages,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
      };

      const response: AxiosResponse<ClaudeResponse> = await axios.post(this.endpoint, requestBody, {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
      });

      const reply = response.data?.content?.[0]?.text?.trim();
      return extractJsonFromCodeFence(reply) ?? '';
    } catch (error) {
      console.error('Claude API error:', error);
      throw new InternalServerErrorException('Failed to get response from Claude');
    }
  }
}
