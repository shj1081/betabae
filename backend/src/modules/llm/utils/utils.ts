export function extractJsonFromCodeFence(text: string): string {
  const match = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (!match) {
    return text;
  }

  return match[1].trim();
}
