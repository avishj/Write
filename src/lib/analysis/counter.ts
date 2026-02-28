/**
 * Text counting — word, character, paragraph, and sentence counting.
 *
 * All functions are pure (no side effects, no framework deps).
 * Designed to run on every keystroke for texts up to ~50k chars (<1ms).
 */

export interface CountResult {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  paragraphs: number;
  sentences: number;
}

/**
 * Count all text metrics.
 */
export function count(text: string): CountResult {
  return {
    words: countWords(text),
    characters: countCharacters(text),
    charactersNoSpaces: countCharacters(text, false),
    paragraphs: countParagraphs(text),
    sentences: countSentences(text),
  };
}

/**
 * Count words in text.
 *
 * Rules:
 * - Split on whitespace boundaries (`/\S+/g`)
 * - Hyphenated words count as one ("well-known" = 1)
 * - Numbers count as words ("3" = 1)
 * - Unicode handled correctly
 */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const matches = trimmed.match(/\S+/g);
  return matches ? matches.length : 0;
}

/**
 * Count characters in text.
 *
 * @param includeSpaces — when true (default), counts all characters;
 *   when false, strips all whitespace (spaces, tabs, newlines) first.
 *
 * Whitespace-only input returns 0 regardless of includeSpaces.
 */
export function countCharacters(text: string, includeSpaces = true): number {
  if (!text || !text.trim()) return 0;
  if (includeSpaces) return text.length;
  return text.replace(/\s/g, "").length;
}

/**
 * Count paragraphs in text.
 *
 * Rules:
 * - Split on two or more newlines (`\n\n+`)
 * - Filter out empty/whitespace-only blocks
 * - Empty/whitespace-only text → 0
 */
export function countParagraphs(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed
    .split(/\n{2,}/)
    .filter((block) => block.trim().length > 0).length;
}

/** Common abbreviations that should not be treated as sentence ends */
const ABBREVIATIONS = new Set([
  "mr",
  "mrs",
  "ms",
  "dr",
  "prof",
  "sr",
  "jr",
  "st",
  "ave",
  "blvd",
  "dept",
  "est",
  "fig",
  "govt",
  "inc",
  "ltd",
  "vs",
  "etc",
  "approx",
  "appt",
  "depts",
  "gen",
  "hon",
  "sgt",
  "cpl",
  "pvt",
  "capt",
  "lt",
  "col",
  "maj",
  "cmdr",
  "adm",
  "rev",
]);

/** Pattern for initials like "D.C.", "U.S.A.", "J.K." */
const INITIALS_RE = /^[A-Z]$/;

/**
 * Count sentences in text.
 *
 * Rules:
 * - Sentence-ending punctuation: `.` `!` `?`
 * - Handles abbreviations heuristically (e.g., "Dr." is not a sentence end)
 * - Handles `...` as a single sentence boundary
 * - Handles `?!` and similar combos as a single boundary
 * - Text with no sentence-ending punctuation but with words → 1 sentence
 * - Empty/whitespace → 0
 */
export function countSentences(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;

  // No words → 0 sentences
  const words = trimmed.match(/\S+/g);
  if (!words) return 0;

  let sentenceCount = 0;
  let i = 0;

  while (i < trimmed.length) {
    const ch = trimmed[i];

    if (ch === ".") {
      // Check for ellipsis: consume all dots
      if (trimmed[i + 1] === ".") {
        while (i < trimmed.length && trimmed[i] === ".") i++;
        // Ellipsis counts as a sentence boundary only if followed by
        // whitespace + a new word (i.e., there is text after the ellipsis)
        // Skip whitespace after ellipsis
        while (i < trimmed.length && /\s/.test(trimmed[i])) i++;
        if (i < trimmed.length) {
          sentenceCount++;
        }
        continue;
      }

      // Check if this period is part of an abbreviation
      // Find the word ending with this period
      const beforeDot = getWordBeforePeriod(trimmed, i);

      if (beforeDot !== null) {
        const lower = beforeDot.toLowerCase();

        // Known abbreviation
        if (ABBREVIATIONS.has(lower)) {
          i++;
          continue;
        }

        // Single uppercase letter (initial like "D." in "D.C.")
        if (INITIALS_RE.test(beforeDot)) {
          i++;
          continue;
        }
      }

      // Regular sentence-ending period
      sentenceCount++;
      i++;
      // Skip any additional punctuation/whitespace after
      while (i < trimmed.length && /[\s.!?]/.test(trimmed[i])) i++;
      continue;
    }

    if (ch === "!" || ch === "?") {
      sentenceCount++;
      i++;
      // Consume consecutive sentence-ending punctuation (e.g., "?!" or "!!!")
      while (i < trimmed.length && /[!?]/.test(trimmed[i])) i++;
      // Skip whitespace
      while (i < trimmed.length && /\s/.test(trimmed[i])) i++;
      continue;
    }

    i++;
  }

  // If no sentence boundaries were found but text has words,
  // count as 1 sentence (e.g., "Hello" with no period)
  return sentenceCount === 0 ? 1 : sentenceCount;
}

/**
 * Extract the word immediately before a period at index `dotIndex`.
 * Returns null if there's no word before the dot.
 */
function getWordBeforePeriod(text: string, dotIndex: number): string | null {
  let end = dotIndex;
  // Walk backward past any preceding dots+letters (handles "D.C.")
  let start = end - 1;
  while (start >= 0 && /[A-Za-z.]/.test(text[start])) {
    start--;
  }
  start++;
  // Extract just the last alphabetical segment before this dot
  const segment = text.slice(start, end);
  // Get the last word-like piece (after the last dot if any)
  const parts = segment.split(".");
  const lastPart = parts[parts.length - 1];
  return lastPart && lastPart.length > 0 ? lastPart : null;
}
