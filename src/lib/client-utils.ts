export function checkSpelling(userInput: string, correctWord: string): boolean {
  // Normalize both strings by trimming whitespace and converting to lowercase
  const normalizedInput = userInput.trim().toLowerCase();
  const normalizedCorrect = correctWord.trim().toLowerCase();
  
  return normalizedInput === normalizedCorrect;
}

export function calculateScore(correctAnswers: number, totalQuestions: number): number {
  if (totalQuestions === 0) return 0;
  return Math.round((correctAnswers / totalQuestions) * 100);
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
}