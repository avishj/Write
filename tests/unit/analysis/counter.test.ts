import { describe, expect, it } from "vitest";
import {
  count,
  countCharacters,
  countParagraphs,
  countSentences,
  countWords,
} from "@lib/analysis/counter";
import {
  ABBREVIATIONS,
  ELLIPSIS,
  EMPTY,
  HYPHENATED,
  MIXED_PUNCTUATION,
  MULTIPLE_NEWLINES,
  MULTIPLE_SENTENCES,
  NUMBERS_IN_TEXT,
  SIMPLE_SENTENCE,
  SINGLE_WORD,
  TRAILING_WHITESPACE,
  TWO_PARAGRAPHS,
  UNICODE_TEXT,
  WHITESPACE_ONLY,
} from "@tests/fixtures/texts";

describe("counter", () => {
  describe("count() — aggregate", () => {
    it("returns all zeros for empty string", () => {
      const result = count(EMPTY);
      expect(result).toEqual({
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        paragraphs: 0,
        sentences: 0,
      });
    });

    it("returns all zeros for whitespace only", () => {
      const result = count(WHITESPACE_ONLY);
      expect(result).toEqual({
        words: 0,
        characters: 0,
        charactersNoSpaces: 0,
        paragraphs: 0,
        sentences: 0,
      });
    });

    it("counts a single word", () => {
      const result = count(SINGLE_WORD);
      expect(result).toEqual({
        words: 1,
        characters: 5,
        charactersNoSpaces: 5,
        paragraphs: 1,
        sentences: 1,
      });
    });

    it("counts a simple sentence", () => {
      const result = count(SIMPLE_SENTENCE);
      expect(result).toEqual({
        words: 9,
        characters: 44,
        charactersNoSpaces: 36,
        paragraphs: 1,
        sentences: 1,
      });
    });
  });

  describe("countWords()", () => {
    it("returns 0 for empty string", () => {
      expect(countWords(EMPTY)).toBe(0);
    });

    it("returns 0 for whitespace only", () => {
      expect(countWords(WHITESPACE_ONLY)).toBe(0);
    });

    it("counts a single word", () => {
      expect(countWords(SINGLE_WORD)).toBe(1);
    });

    it("counts words in a simple sentence", () => {
      expect(countWords(SIMPLE_SENTENCE)).toBe(9);
    });

    it("treats hyphenated words as one word", () => {
      expect(countWords(HYPHENATED)).toBe(2);
    });

    it("handles Unicode text", () => {
      expect(countWords(UNICODE_TEXT)).toBe(3);
    });

    it("ignores trailing whitespace", () => {
      expect(countWords(TRAILING_WHITESPACE)).toBe(2);
    });

    it("counts numbers as words", () => {
      expect(countWords(NUMBERS_IN_TEXT)).toBe(4);
    });
  });

  describe("countCharacters()", () => {
    it("returns 0 for empty string", () => {
      expect(countCharacters(EMPTY)).toBe(0);
    });

    it("returns 0 for whitespace only", () => {
      expect(countCharacters(WHITESPACE_ONLY)).toBe(0);
    });

    it("counts characters with spaces (default)", () => {
      expect(countCharacters(SIMPLE_SENTENCE)).toBe(44);
    });

    it("counts characters without spaces", () => {
      expect(countCharacters(SIMPLE_SENTENCE, false)).toBe(36);
    });

    it("counts Unicode characters correctly", () => {
      expect(countCharacters(UNICODE_TEXT)).toBe(17);
    });

    it("includes leading and trailing spaces in count", () => {
      expect(countCharacters("  hello  ")).toBe(9);
    });

    it("excludes all whitespace when includeSpaces is false", () => {
      expect(countCharacters("  hello  ", false)).toBe(5);
    });
  });

  describe("countParagraphs()", () => {
    it("returns 0 for empty string", () => {
      expect(countParagraphs(EMPTY)).toBe(0);
    });

    it("returns 0 for whitespace only", () => {
      expect(countParagraphs(WHITESPACE_ONLY)).toBe(0);
    });

    it("counts a single paragraph", () => {
      expect(countParagraphs(SIMPLE_SENTENCE)).toBe(1);
    });

    it("counts two paragraphs", () => {
      expect(countParagraphs(TWO_PARAGRAPHS)).toBe(2);
    });

    it("collapses multiple newlines", () => {
      expect(countParagraphs(MULTIPLE_NEWLINES)).toBe(2);
    });

    it("ignores trailing whitespace", () => {
      expect(countParagraphs(TRAILING_WHITESPACE)).toBe(1);
    });
  });

  describe("countSentences()", () => {
    it("returns 0 for empty string", () => {
      expect(countSentences(EMPTY)).toBe(0);
    });

    it("returns 0 for whitespace only", () => {
      expect(countSentences(WHITESPACE_ONLY)).toBe(0);
    });

    it("counts a single word as one sentence", () => {
      expect(countSentences(SINGLE_WORD)).toBe(1);
    });

    it("counts a single sentence", () => {
      expect(countSentences(SIMPLE_SENTENCE)).toBe(1);
    });

    it("counts multiple sentences", () => {
      expect(countSentences(MULTIPLE_SENTENCES)).toBe(3);
    });

    it("handles abbreviations correctly", () => {
      expect(countSentences(ABBREVIATIONS)).toBe(1);
    });

    it("handles ellipsis as sentence boundary", () => {
      expect(countSentences(ELLIPSIS)).toBe(2);
    });

    it("handles mixed punctuation", () => {
      expect(countSentences(MIXED_PUNCTUATION)).toBe(2);
    });

    it("trailing ellipsis does not add phantom sentence", () => {
      expect(countSentences("Hmm...")).toBe(1);
    });

    it("trailing period counts as sentence end", () => {
      expect(countSentences("Hello world.")).toBe(1);
    });

    it("counts trailing fragment after punctuation as sentence", () => {
      expect(countSentences("Hello world. Goodbye world")).toBe(2);
    });

    it("handles initialism at end of sentence", () => {
      expect(countSentences("I live in D.C. It is busy.")).toBe(2);
    });

    it("handles initialism mid-sentence", () => {
      expect(countSentences("The U.S. is large.")).toBe(1);
    });
  });

  describe("countParagraphs() — line endings", () => {
    it("handles Windows-style \\r\\n line endings", () => {
      expect(countParagraphs("First.\r\n\r\nSecond.")).toBe(2);
    });

    it("handles mixed line endings", () => {
      expect(countParagraphs("First.\n\nSecond.\r\n\r\nThird.")).toBe(3);
    });
  });
});
