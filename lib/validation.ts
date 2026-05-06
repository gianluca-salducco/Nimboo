export const MIN_ANSWER_LENGTH = 10;
export const MAX_ANSWER_LENGTH = 1000;

export function validateAnswer(value: string): boolean {
  return value.length >= MIN_ANSWER_LENGTH && value.length <= MAX_ANSWER_LENGTH;
}
