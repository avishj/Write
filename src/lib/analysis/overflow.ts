/**
 * Overflow detection — find where text exceeds a limit.
 *
 * Used by the editor to apply inline overflow highlighting.
 * Returns the character index where the overflow starts so the
 * editor can split content into "within limit" and "over limit" spans.
 *
 * Pure function, no side effects.
 */

import { countParagraphs, countWords } from "./counter";

export interface OverflowResult {
  isOver: boolean;
  overflowAmount: number;
  boundaryCharIndex: number;
}

export type LimitType = "words" | "characters" | "paragraphs";

/**
 * Detect overflow in text against a limit.
 *
 * @param text — the full text to check
 * @param limitType — what unit to limit by
 * @param limitValue — the maximum allowed count
 * @returns overflow result with boundary position
 */
export function detectOverflow(
  text: string,
  limitType: LimitType,
  limitValue: number,
): OverflowResult {
  const noOverflow: OverflowResult = {
    isOver: false,
    overflowAmount: 0,
    boundaryCharIndex: text.length,
  };

  if (!text) return noOverflow;

  switch (limitType) {
    case "words":
      return detectWordOverflow(text, limitValue);
    case "characters":
      return detectCharacterOverflow(text, limitValue);
    case "paragraphs":
      return detectParagraphOverflow(text, limitValue);
  }
}

/**
 * For word limits: scan word boundaries until limitValue words counted.
 * Returns the character index after the last allowed word.
 */
function detectWordOverflow(text: string, limit: number): OverflowResult {
  const totalWords = countWords(text);

  if (totalWords <= limit) {
    return { isOver: false, overflowAmount: 0, boundaryCharIndex: text.length };
  }

  if (limit === 0) {
    return {
      isOver: true,
      overflowAmount: totalWords,
      boundaryCharIndex: 0,
    };
  }

  // Walk through the text, counting words (non-whitespace sequences)
  let wordCount = 0;
  let i = 0;

  while (i < text.length && wordCount < limit) {
    // Skip whitespace
    while (i < text.length && /\s/.test(text[i])) i++;
    if (i >= text.length) break;

    // We're at the start of a word
    wordCount++;

    // Skip word characters
    while (i < text.length && !/\s/.test(text[i])) i++;
  }

  // Skip whitespace after the last allowed word to find overflow start
  while (i < text.length && /\s/.test(text[i])) i++;

  return {
    isOver: true,
    overflowAmount: totalWords - limit,
    boundaryCharIndex: i,
  };
}

/**
 * For character limits: the boundary is simply the limit value.
 */
function detectCharacterOverflow(text: string, limit: number): OverflowResult {
  if (text.length <= limit) {
    return { isOver: false, overflowAmount: 0, boundaryCharIndex: text.length };
  }

  return {
    isOver: true,
    overflowAmount: text.length - limit,
    boundaryCharIndex: limit,
  };
}

/**
 * For paragraph limits: count paragraph boundaries until limitValue
 * paragraphs have been counted. Returns the character index at the
 * start of the next paragraph.
 */
function detectParagraphOverflow(text: string, limit: number): OverflowResult {
  const totalParagraphs = countParagraphs(text);

  if (totalParagraphs <= limit) {
    return { isOver: false, overflowAmount: 0, boundaryCharIndex: text.length };
  }

  if (limit === 0) {
    return {
      isOver: true,
      overflowAmount: totalParagraphs,
      boundaryCharIndex: 0,
    };
  }

  // Walk through the text, counting paragraph boundaries (double newlines)
  let paraCount = 1; // First paragraph starts at the beginning
  let i = 0;

  while (i < text.length && paraCount < limit) {
    if (text[i] === "\n") {
      // Check for paragraph break (two or more newlines)
      const start = i;
      while (i < text.length && text[i] === "\n") i++;
      if (i - start >= 2) {
        // Skip any leading whitespace in the next paragraph
        while (i < text.length && text[i] !== "\n" && /\s/.test(text[i])) i++;
        if (i < text.length) {
          paraCount++;
        }
      }
    } else {
      i++;
    }
  }

  // Now find the next paragraph break after the limit
  if (paraCount >= limit) {
    // Continue scanning until we find the next paragraph boundary
    while (i < text.length) {
      if (text[i] === "\n") {
        const start = i;
        while (i < text.length && text[i] === "\n") i++;
        if (i - start >= 2) {
          // Skip leading whitespace
          while (i < text.length && text[i] !== "\n" && /\s/.test(text[i]))
            i++;
          // This is the start of the overflow paragraph
          return {
            isOver: true,
            overflowAmount: totalParagraphs - limit,
            boundaryCharIndex: i,
          };
        }
      } else {
        i++;
      }
    }
  }

  return { isOver: false, overflowAmount: 0, boundaryCharIndex: text.length };
}
