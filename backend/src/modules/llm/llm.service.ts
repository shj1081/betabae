import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ErrorResponseDto } from 'src/dto/common/error.response.dto';

@Injectable()
export class LlmService {
  constructor() {}

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
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new InternalServerErrorException(
        new ErrorResponseDto(
          'OpenAI API key is not set in environment variables',
        ),
      );
    }
    // const openai = new OpenAI({ apiKey });
    // const response = await openai.chat.completions.create({
    //   model: 'gpt-4o',
    //   messages: [{ role: 'user', content: userMessage }],
    // });
    const response = {
      choices: [
        {
          message: {
            content: 'This is a mock response from the LLM.',
          },
        },
      ],
    };
    return (
      response.choices[0]?.message?.content ||
      '죄송합니다. 답변을 찾을 수 없습니다.'
    );
  }
}
