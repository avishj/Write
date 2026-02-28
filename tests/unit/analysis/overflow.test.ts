import { describe, expect, it } from "vitest";
import { detectOverflow } from "@lib/analysis/overflow";

/** Helper: generate N words separated by spaces */
function nWords(n: number): string {
  return Array.from({ length: n }, (_, i) => `word${i}`).join(" ");
}

/** Helper: generate N paragraphs separated by double newlines */
function nParagraphs(n: number): string {
  return Array.from({ length: n }, (_, i) => `Paragraph ${i} content.`).join(
    "\n\n",
  );
}

describe("overflow", () => {
  describe("word limits", () => {
    it("no overflow when under limit", () => {
      const text = nWords(50);
      const result = detectOverflow(text, "words", 100);
      expect(result.isOver).toBe(false);
      expect(result.overflowAmount).toBe(0);
    });

    it("no overflow when at exact limit", () => {
      const text = nWords(100);
      const result = detectOverflow(text, "words", 100);
      expect(result.isOver).toBe(false);
      expect(result.overflowAmount).toBe(0);
    });

    it("detects overflow when over limit", () => {
      const text = nWords(120);
      const result = detectOverflow(text, "words", 100);
      expect(result.isOver).toBe(true);
      expect(result.overflowAmount).toBe(20);
    });

    it("boundary char index marks overflow start", () => {
      // "aaa bbb ccc" with limit 2 → boundary should be after "bbb"
      const text = "aaa bbb ccc";
      const result = detectOverflow(text, "words", 2);
      expect(result.isOver).toBe(true);
      expect(result.overflowAmount).toBe(1);
      // Boundary should be at the start of "ccc" (index 8)
      expect(result.boundaryCharIndex).toBe(8);
      expect(text.slice(result.boundaryCharIndex)).toBe("ccc");
    });
  });

  describe("character limits", () => {
    it("no overflow when under limit", () => {
      const result = detectOverflow("Hello", "characters", 10);
      expect(result.isOver).toBe(false);
      expect(result.overflowAmount).toBe(0);
    });

    it("detects overflow when over limit", () => {
      const result = detectOverflow("Hello World", "characters", 5);
      expect(result.isOver).toBe(true);
      expect(result.overflowAmount).toBe(6);
      expect(result.boundaryCharIndex).toBe(5);
    });

    it("no overflow at exact limit", () => {
      const result = detectOverflow("Hello", "characters", 5);
      expect(result.isOver).toBe(false);
      expect(result.overflowAmount).toBe(0);
    });
  });

  describe("paragraph limits", () => {
    it("no overflow under limit", () => {
      const text = nParagraphs(2);
      const result = detectOverflow(text, "paragraphs", 3);
      expect(result.isOver).toBe(false);
      expect(result.overflowAmount).toBe(0);
    });

    it("detects overflow when over limit", () => {
      const text = nParagraphs(3);
      const result = detectOverflow(text, "paragraphs", 2);
      expect(result.isOver).toBe(true);
      expect(result.overflowAmount).toBe(1);
    });

    it("boundary at start of overflow paragraph", () => {
      const text = "First para.\n\nSecond para.\n\nThird para.";
      const result = detectOverflow(text, "paragraphs", 2);
      expect(result.isOver).toBe(true);
      // Boundary should be at the start of "Third para."
      const overflow = text.slice(result.boundaryCharIndex);
      expect(overflow).toBe("Third para.");
    });
  });

  describe("edge cases", () => {
    it("empty text with limit returns no overflow", () => {
      const result = detectOverflow("", "words", 100);
      expect(result.isOver).toBe(false);
      expect(result.overflowAmount).toBe(0);
    });

    it("limit of 0 means everything overflows", () => {
      const result = detectOverflow("Hello world", "words", 0);
      expect(result.isOver).toBe(true);
      expect(result.boundaryCharIndex).toBe(0);
    });

    it("empty text with limit 0 returns no overflow", () => {
      const result = detectOverflow("", "words", 0);
      expect(result.isOver).toBe(false);
    });
  });
});
