export class RealBaeThoughtRequestDto {
  messageText: string;
  chatId: number;
}

export class RealBaeThoughtResponseDto {
  response: string;

  constructor(response: string) {
    this.response = response;
  }
}
