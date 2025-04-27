export class ChatAnalysisResponseDto {
  analysis: string;
  llmRawResponse: string;

  constructor(analysis: string, llmRawResponse: string) {
    this.analysis = analysis;
    this.llmRawResponse = llmRawResponse;
  }
}
