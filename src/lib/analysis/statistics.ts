/**
 * Text statistics — average lengths, frequency analysis, top words.
 *
 * Pure functions, no side effects. Uses the same word/sentence
 * tokenization as counter.ts for consistency.
 */

import { countSentences, countWords } from "./counter";

export interface TextStatistics {
  avgWordLength: number;
  avgSentenceLength: number;
  uniqueWordCount: number;
  longestWord: { word: string; length: number };
  topWords: Array<{ word: string; count: number }>;
}

/**
 * Common English stop words excluded from top-words analysis.
 * Kept minimal — only the most frequent function words.
 */
const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "for",
  "from",
  "had",
  "has",
  "have",
  "he",
  "her",
  "his",
  "how",
  "i",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "my",
  "no",
  "not",
  "of",
  "on",
  "or",
  "our",
  "she",
  "so",
  "than",
  "that",
  "the",
  "their",
  "them",
  "then",
  "there",
  "these",
  "they",
  "this",
  "to",
  "up",
  "us",
  "was",
  "we",
  "were",
  "what",
  "when",
  "which",
  "who",
  "will",
  "with",
  "would",
  "you",
  "your",
]);

/**
 * Analyze text statistics: word lengths, frequencies, unique counts.
 *
 * @param text — input text
 * @param topN — number of top words to return (default 10)
 */
export function analyzeStatistics(text: string, topN = 10): TextStatistics {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      avgWordLength: 0,
      avgSentenceLength: 0,
      uniqueWordCount: 0,
      longestWord: { word: "", length: 0 },
      topWords: [],
    };
  }

  const rawWords = trimmed.match(/\S+/g);
  if (!rawWords || rawWords.length === 0) {
    return {
      avgWordLength: 0,
      avgSentenceLength: 0,
      uniqueWordCount: 0,
      longestWord: { word: "", length: 0 },
      topWords: [],
    };
  }

  const wordCount = countWords(trimmed);
  const sentenceCount = countSentences(trimmed);

  // Strip punctuation from each word for analysis
  const cleanWords = rawWords
    .map((w) => w.replace(/[^\p{L}\p{N}'-]/gu, ""))
    .filter((w) => w.length > 0);

  // Average word length (using clean words)
  const totalLength = cleanWords.reduce((sum, w) => sum + w.length, 0);
  const avgWordLength =
    cleanWords.length > 0
      ? Math.round((totalLength / cleanWords.length) * 100) / 100
      : 0;

  // Average sentence length (words per sentence)
  const avgSentenceLength =
    sentenceCount > 0
      ? Math.round((wordCount / sentenceCount) * 100) / 100
      : 0;

  // Unique words (case-insensitive)
  const uniqueWords = new Set(cleanWords.map((w) => w.toLowerCase()));
  const uniqueWordCount = uniqueWords.size;

  // Longest word
  let longestWord = { word: "", length: 0 };
  for (const word of cleanWords) {
    if (word.length > longestWord.length) {
      longestWord = { word, length: word.length };
    }
  }

  // Word frequency (case-insensitive, excluding stop words)
  const freq = new Map<string, number>();
  for (const word of cleanWords) {
    const lower = word.toLowerCase();
    if (STOP_WORDS.has(lower)) continue;
    freq.set(lower, (freq.get(lower) ?? 0) + 1);
  }

  // Sort by frequency descending, take top N
  const topWords = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({ word, count }));

  return {
    avgWordLength,
    avgSentenceLength,
    uniqueWordCount,
    longestWord,
    topWords,
  };
}
