export function checkSpelling(userInput: string, correctWord: string): boolean {
  return userInput.toLowerCase().trim() === correctWord.toLowerCase().trim();
}