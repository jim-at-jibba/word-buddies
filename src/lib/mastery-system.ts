import { StoredWord } from './storage/types';

// Spaced repetition intervals in milliseconds (days converted to ms)
const MASTERY_INTERVALS = [
  0,                    // Level 0: Review immediately
  1 * 24 * 60 * 60 * 1000,    // Level 1: 1 day
  3 * 24 * 60 * 60 * 1000,    // Level 2: 3 days
  7 * 24 * 60 * 60 * 1000,    // Level 3: 7 days
  14 * 24 * 60 * 60 * 1000,   // Level 4: 14 days
  30 * 24 * 60 * 60 * 1000,   // Level 5: 30 days
];

export interface MasteryLevelInfo {
  level: number;
  label: string;
  color: string;
  emoji: string;
  nextReviewDays: number;
}

export function getMasteryLevelInfo(level: number): MasteryLevelInfo {
  const levels: MasteryLevelInfo[] = [
    { level: 0, label: 'Need to Practice', color: 'red', emoji: '🔴', nextReviewDays: 0 },
    { level: 1, label: 'Getting Started', color: 'yellow-light', emoji: '🟡', nextReviewDays: 1 },
    { level: 2, label: 'Building Confidence', color: 'yellow', emoji: '🟡', nextReviewDays: 3 },
    { level: 3, label: 'Doing Well!', color: 'orange', emoji: '🟠', nextReviewDays: 7 },
    { level: 4, label: 'Almost There!', color: 'green-light', emoji: '🟢', nextReviewDays: 14 },
    { level: 5, label: 'MASTERED!', color: 'green', emoji: '🟩', nextReviewDays: 30 },
  ];
  
  return levels[Math.min(Math.max(level, 0), 5)];
}

export function getLevelUpMessage(newLevel: number, isCorrect: boolean): string {
  if (!isCorrect) {
    const messages = [
      "Not quite! Let's try again! 💪",
      "Oops! Keep practicing! 😺",
      "Almost! You've got this! 🌟",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  const messages: Record<number, string[]> = {
    1: ["Great start! ⭐", "Good job! Keep going! 🎯", "Nice work! 😸"],
    2: ["You're getting better! 🌟", "Keep it up! 💪", "Awesome progress! 🎉"],
    3: ["Doing great! 🔥", "You're on a roll! 🚀", "Fantastic! 🌈"],
    4: ["Almost mastered! ⭐⭐", "So close! Keep going! 💫", "Amazing work! 🎊"],
    5: ["MASTERED! 🎉🌟", "You're a spelling champion! 🏆", "Perfect! Word mastered! 👑"],
  };

  const levelMessages = messages[newLevel] || messages[1];
  return levelMessages[Math.floor(Math.random() * levelMessages.length)];
}

export function updateWordMastery(word: StoredWord, isCorrect: boolean): StoredWord {
  const currentLevel = word.masteryLevel || 0;
  const currentStreak = word.consecutiveCorrect || 0;
  
  let newLevel: number;
  let newStreak: number;
  
  if (isCorrect) {
    // Increment streak and level (max level 5)
    newStreak = currentStreak + 1;
    newLevel = Math.min(newStreak, 5);
  } else {
    // Drop 2 levels (minimum 0) and reset streak
    newLevel = Math.max(currentLevel - 2, 0);
    newStreak = 0;
  }
  
  // Calculate next review date based on new level
  const now = Date.now();
  const nextReview = now + MASTERY_INTERVALS[newLevel];
  
  return {
    ...word,
    masteryLevel: newLevel,
    consecutiveCorrect: newStreak,
    lastAttempted: now,
    nextReview,
    attempts: word.attempts + 1,
    correctAttempts: isCorrect ? word.correctAttempts + 1 : word.correctAttempts,
  };
}

export function getHeatmapColor(level: number): string {
  const colors: Record<number, string> = {
    0: 'bg-red-500',
    1: 'bg-yellow-300',
    2: 'bg-yellow-500',
    3: 'bg-orange-500',
    4: 'bg-green-400',
    5: 'bg-green-700',
  };
  return colors[Math.min(Math.max(level, 0), 5)] || colors[0];
}

export function getMasteryProgress(words: StoredWord[]): {
  total: number;
  mastered: number;
  percentage: number;
  byLevel: Record<number, number>;
} {
  const total = words.length;
  const byLevel: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  words.forEach(word => {
    const level = word.masteryLevel || 0;
    byLevel[level] = (byLevel[level] || 0) + 1;
  });
  
  const mastered = byLevel[5] || 0;
  const percentage = total > 0 ? Math.round((mastered / total) * 100) : 0;
  
  return { total, mastered, percentage, byLevel };
}
