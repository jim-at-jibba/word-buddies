export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function formatDateTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-AU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${remainingSeconds}s`;
}

export interface SpellingDifference {
  index: number;
  expected: string;
  actual: string;
  type: 'missing' | 'extra' | 'wrong';
}

export function findSpellingDifferences(correctWord: string, userSpelling: string): SpellingDifference[] {
  const differences: SpellingDifference[] = [];
  const correct = correctWord.toLowerCase();
  const user = userSpelling.toLowerCase();
  
  let correctIndex = 0;
  let userIndex = 0;
  
  while (correctIndex < correct.length || userIndex < user.length) {
    if (correctIndex >= correct.length) {
      // Extra characters at the end
      differences.push({
        index: userIndex,
        expected: '',
        actual: user[userIndex],
        type: 'extra'
      });
      userIndex++;
    } else if (userIndex >= user.length) {
      // Missing characters at the end
      differences.push({
        index: correctIndex,
        expected: correct[correctIndex],
        actual: '',
        type: 'missing'
      });
      correctIndex++;
    } else if (correct[correctIndex] === user[userIndex]) {
      // Characters match, continue
      correctIndex++;
      userIndex++;
    } else {
      // Characters don't match - determine if it's substitution, insertion, or deletion
      
      // Look ahead to see if we can find the correct character later in user input
      const foundInUser = user.indexOf(correct[correctIndex], userIndex + 1);
      // Look ahead to see if we can find the user character later in correct word
      const foundInCorrect = correct.indexOf(user[userIndex], correctIndex + 1);
      
      if (foundInUser !== -1 && (foundInCorrect === -1 || foundInUser - userIndex < foundInCorrect - correctIndex)) {
        // This looks like an extra character in user input
        differences.push({
          index: userIndex,
          expected: '',
          actual: user[userIndex],
          type: 'extra'
        });
        userIndex++;
      } else if (foundInCorrect !== -1) {
        // This looks like a missing character in user input
        differences.push({
          index: correctIndex,
          expected: correct[correctIndex],
          actual: '',
          type: 'missing'
        });
        correctIndex++;
      } else {
        // This is a substitution
        differences.push({
          index: correctIndex,
          expected: correct[correctIndex],
          actual: user[userIndex],
          type: 'wrong'
        });
        correctIndex++;
        userIndex++;
      }
    }
  }
  
  return differences;
}

export function getSpellingHighlightData(correctWord: string, userSpelling: string) {
  const differences = findSpellingDifferences(correctWord, userSpelling);
  
  // Build data for correct word highlighting
  const correctHighlightData = correctWord.split('').map((char, i) => {
    const diff = differences.find(d => d.index === i && (d.type === 'missing' || d.type === 'wrong'));
    return {
      char,
      isHighlighted: !!diff,
      highlightType: diff?.type || null,
    };
  });
  
  // Build data for user spelling highlighting
  const userHighlightData = userSpelling.split('').map((char, i) => {
    const diff = differences.find(d => d.index === i && (d.type === 'extra' || d.type === 'wrong'));
    return {
      char,
      isHighlighted: !!diff,
      highlightType: diff?.type || null,
    };
  });
  
  return { correctHighlightData, userHighlightData };
}