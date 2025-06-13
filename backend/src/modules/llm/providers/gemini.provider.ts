import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import {
  LLMMessageContext,
  LLMProviderBaseService,
} from 'src/modules/llm/providers/llm-provider-base.service';

enum GeminiModel {
  FLASH = 'models/gemini-1.5-flash',
  PRO = 'models/gemini-1.5-pro',
  FLASH_8B = 'models/gemini-1.5-flash-8b',
}

type GeminiRole = 'user' | 'model';

interface GeminiRequest {
  contents: Array<{
    role: GeminiRole;
    parts: Array<{ text: string }>;
  }>;
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
    };
    finishReason?: string;
  }>;
}

@Injectable()
export class GeminiProvider extends LLMProviderBaseService {
  private readonly endpoint = 'https://generativelanguage.googleapis.com/v1beta';
  private readonly model = GeminiModel.FLASH;

  async getLLMResponse(messages: LLMMessageContext[]): Promise<string> {
    console.log('GeminiProvider.getLLMResponse called with messages:', messages);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) throw new Error('GEMINI_API_KEY not set');

      const contents: GeminiRequest['contents'] = messages.map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const url = `${this.endpoint}/${this.model}:generateContent?key=${apiKey}`;

      const response: AxiosResponse<GeminiResponse> = await axios.post(
        url,
        { contents },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      console.log('Gemini API response:', response.data.candidates[0]?.content?.parts);
      console.log(
        'Gemini parts:',
        JSON.stringify(response.data?.candidates?.[0]?.content?.parts, null, 2),
      );

      const parts = response.data?.candidates?.[0]?.content?.parts;
      const text = parts?.length ? parts[0]?.text?.trim() : '';

      if (!text) {
        console.warn('Gemini response was missing expected text structure:', response.data);
        return '';
      }

      console.log('Extracted text from Gemini response:', text);
      return text;
    } catch (error) {
      console.error('Gemini API error:', error?.response?.data || error.message);
      throw new InternalServerErrorException('Failed to get response from Gemini');
    }
  }
}
