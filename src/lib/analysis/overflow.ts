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
 * For paragraph limits: find the character index where the (limit+1)th
 * paragraph begins. Uses the same splitting logic as countParagraphs
 * (double newlines, possibly \r\n) to stay consistent.
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

  // Single pass: find paragraph boundaries (2+ consecutive newlines)
  // counting non-empty paragraphs until we've passed `limit` of them.
  let paraCount = 0;
  let i = 0;
  const len = text.length;

  while (i < len) {
    // Skip paragraph-break whitespace (newlines between paragraphs)
    if (text[i] === "\n" || text[i] === "\r") {
      i++;
      continue;
    }

    // We're at the start of a non-empty paragraph
    paraCount++;

    if (paraCount > limit) {
      // This is the first char of the overflow paragraph
      return {
        isOver: true,
        overflowAmount: totalParagraphs - limit,
        boundaryCharIndex: i,
      };
    }

    // Consume the rest of this paragraph (until a double-newline break)
    while (i < len) {
      if (text[i] === "\n" || text[i] === "\r") {
        // Check if this is a paragraph break (2+ line endings)
        const breakStart = i;
        let lineEndCount = 0;
        while (i < len && (text[i] === "\n" || text[i] === "\r")) {
          // Count \r\n as one line ending, \n as one
          if (text[i] === "\r" && i + 1 < len && text[i + 1] === "\n") {
            i += 2;
          } else {
            i++;
          }
          lineEndCount++;
        }
        if (lineEndCount >= 2) {
          // Paragraph break found — outer loop will handle next paragraph
          break;
        }
        // Single newline — still same paragraph, continue consuming
      } else {
        i++;
      }
    }
  }

  // Should not reach here given totalParagraphs > limit, but guard anyway
  return {
    isOver: true,
    overflowAmount: totalParagraphs - limit,
    boundaryCharIndex: text.length,
  };
}
