/**
 * Readability analysis — Flesch-Kincaid, Coleman-Liau, Flesch Reading Ease.
 *
 * Uses the `syllable` package for accurate syllable counting and
 * @wooorm formula packages for readability score calculations.
 *
 * Pure functions, no side effects.
 * Requires at least 1 sentence and 1 word to produce meaningful results.
 */

import { colemanLiau } from "coleman-liau";
import { flesch } from "flesch";
import { fleschKincaid } from "flesch-kincaid";
import { syllable } from "syllable";

import { countSentences, countWords } from "@lib/analysis/counter";

export interface ReadabilityResult {
  fleschKincaid: { grade: number; label: string };
  colemanLiau: { grade: number; label: string };
  fleschReadingEase: { score: number; label: string };
}

/**
 * Re-export syllable counting for direct use (e.g., in tests or
 * other modules that need per-word syllable counts).
 */
export function countSyllables(word: string): number {
  return syllable(word);
}

/**
 * Analyze readability of the given text.
 * Returns null if the text has fewer than 1 word or 1 sentence.
 */
export function analyzeReadability(text: string): ReadabilityResult | null {
  const trimmed = text.trim();
  if (!trimmed) return null;

  const wordCount = countWords(trimmed);
  const sentenceCount = countSentences(trimmed);

  if (wordCount === 0 || sentenceCount === 0) return null;

  // Count total syllables and letters across all words
  const words = trimmed.match(/\S+/g) ?? [];
  let totalSyllables = 0;
  let totalLetters = 0;

  for (const word of words) {
    totalSyllables += syllable(word);
    // Coleman-Liau uses letter count (alphabetic chars only)
    const clean = word.replace(/[^a-zA-Z\u00C0-\u024F]/g, "");
    totalLetters += clean.length;
  }

  const counts = { sentence: sentenceCount, word: wordCount, syllable: totalSyllables };

  // Flesch-Kincaid Grade Level
  const fkGrade = fleschKincaid(counts);

  // Coleman-Liau Index (uses letter count, not syllables)
  const clGrade = colemanLiau({ sentence: sentenceCount, word: wordCount, letter: totalLetters });

  // Flesch Reading Ease
  const freScore = flesch(counts);

  const fkRounded = round(fkGrade, 1);
  const clRounded = round(clGrade, 1);
  const freRounded = round(freScore, 1);

  return {
    fleschKincaid: {
      grade: fkRounded,
      label: gradeLabel(fkRounded),
    },
    colemanLiau: {
      grade: clRounded,
      label: gradeLabel(clRounded),
    },
    fleschReadingEase: {
      score: freRounded,
      label: readingEaseLabel(freRounded),
    },
  };
}

/** Round to N decimal places */
function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Map a grade level to a human-readable label */
function gradeLabel(grade: number): string {
  const g = Math.round(grade);
  if (g <= 1) return "Grade 1 — Very easy to read";
  if (g <= 3) return `Grade ${g} — Easy to read`;
  if (g <= 5) return `Grade ${g} — Fairly easy to read`;
  if (g <= 8) return `Grade ${g} — Plain language`;
  if (g <= 10) return `Grade ${g} — Fairly difficult to read`;
  if (g <= 12) return `Grade ${g} — Difficult to read`;
  if (g <= 16) return `Grade ${g} — College level`;
  return `Grade ${g} — Professional/academic`;
}

/** Map a Flesch Reading Ease score to a human-readable label */
function readingEaseLabel(score: number): string {
  if (score >= 90) return "Very easy to read";
  if (score >= 80) return "Easy to read";
  if (score >= 70) return "Fairly easy to read";
  if (score >= 60) return "Standard";
  if (score >= 50) return "Fairly difficult to read";
  if (score >= 30) return "Difficult to read";
  return "Very difficult to read";
}
