// Spelling curriculum words

// Year 1 Common Exception Words (from English Appendix 1: Spelling)
export const YEAR_1_WORDS: string[] = [
  "the", "a", "do", "to", "today", "of", "said", "says", "are", "were", "was", 
  "is", "his", "has", "I", "you", "your", "they", "be", "he", "me", "she", "we", 
  "no", "go", "so", "by", "my", "here", "there", "where", "love", "come", "some", 
  "one", "once", "ask", "friend", "school", "put", "push", "pull", "full", "house", "our"
];

// Year 2 Common Exception Words (from English Appendix 1: Spelling)
export const YEAR_2_WORDS: string[] = [
  "door", "floor", "poor", "because", "find", "kind", "mind", "behind", "child", 
  "children", "wild", "climb", "most", "only", "both", "old", "cold", "gold", 
  "hold", "told", "every", "everybody", "even", "great", "break", "steak", 
  "pretty", "beautiful", "after", "fast", "last", "past", "father", "class", 
  "grass", "pass", "plant", "path", "bath", "hour", "move", "prove", "improve", 
  "sure", "sugar", "eye", "could", "should", "would", "who", "whole", "any", 
  "many", "clothes", "busy", "people", "water", "again", "half", "money", "Mr", 
  "Mrs", "parents"
];

// Year 3 & 4 Words (combined as per current curriculum)
export const YEAR_3_WORDS: string[] = [
  "accident", "accidentally", "actual", "actually", "address", "answer", 
  "appear", "arrive", "believe", "bicycle", "breath", "breathe", "build", 
  "busy", "business", "calendar", "caught", "centre", "century", "certain", 
  "circle", "complete", "consider", "continue", "decide", "describe", 
  "different", "difficult", "disappear", "early", "earth", "eight", "eighth", 
  "enough", "exercise", "experience", "experiment", "extreme", "famous", 
  "favourite", "February", "forward", "forwards", "fruit", "grammar", "group", 
  "guard", "guide", "heard", "heart", "height", "history", "imagine", 
  "increase", "important", "interest", "island", "knowledge", "learn", 
  "length", "library", "material", "medicine", "mention", "minute", "natural", 
  "naughty", "notice", "occasion", "occasionally", "often", "opposite", 
  "ordinary", "particular", "peculiar", "perhaps", "popular", "position", 
  "possess", "possession", "possible", "potatoes", "pressure", "probably", 
  "promise", "purpose", "quarter", "question", "recent", "regular", "reign", 
  "remember", "sentence", "separate", "special", "straight", "strange", 
  "strength", "suppose", "surprise", "therefore", "though", "although", 
  "thought", "through", "various", "weight", "woman", "women"
];

// Get words for a specific year group (cumulative approach)
export function getWordsForYearGroup(yearGroup: number): string[] {
  switch (yearGroup) {
    case 1:
      return [...YEAR_1_WORDS];
    case 2:
      return [...YEAR_1_WORDS, ...YEAR_2_WORDS];
    case 3:
      return [...YEAR_1_WORDS, ...YEAR_2_WORDS, ...YEAR_3_WORDS];
    default:
      // Default to Year 3 (current behavior)
      return [...YEAR_1_WORDS, ...YEAR_2_WORDS, ...YEAR_3_WORDS];
  }
}

// Get word count for a year group
export function getWordCountForYearGroup(yearGroup: number): number {
  return getWordsForYearGroup(yearGroup).length;
}

// Get year group display name
export function getYearGroupDisplayName(yearGroup: number): string {
  switch (yearGroup) {
    case 1:
      return "Year 1";
    case 2:
      return "Year 2";
    case 3:
      return "Year 3 & 4";
    default:
      return "Year 3 & 4";
  }
}