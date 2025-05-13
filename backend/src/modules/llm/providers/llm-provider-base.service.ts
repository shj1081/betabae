import { Injectable } from '@nestjs/common';

export interface PersonalityContext {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface LoveLanguageContext {
  wordsOfAffirmation: number;
  actsOfService: number;
  receivingGifts: number;
  qualityTime: number;
  physicalTouch: number;
}

export interface UserContext {
  name: string;
  birthday: string;
  gender: string;
  city: string;
  interests: string;
  mbti?: string;
}

export interface MessageContext {
  message: string;
  pastMesages: string[];
  userSummary: string;
}

export interface LLMMessageContext {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

@Injectable()
export abstract class LLMProviderBaseService {
  abstract getLLMResponse(messages: LLMMessageContext[]): Promise<string>;
}
