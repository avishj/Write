import { describe, expect, it } from "vitest";
import {
  analyzeReadability,
  countSyllables,
} from "@lib/analysis/readability";
import {
  EMPTY,
  KNOWN_GRADE_5,
  KNOWN_GRADE_12,
  SIMPLE_SENTENCE,
  WHITESPACE_ONLY,
} from "@tests/fixtures/texts";

describe("readability", () => {
  describe("countSyllables()", () => {
    it("counts 'the' as 1 syllable", () => {
      expect(countSyllables("the")).toBe(1);
    });

    it("counts 'beautiful' as 3 syllables", () => {
      expect(countSyllables("beautiful")).toBe(3);
    });

    it("counts 'create' as 2 syllables (silent-e)", () => {
      expect(countSyllables("create")).toBe(2);
    });

    it("counts 'created' as 3 syllables", () => {
      expect(countSyllables("created")).toBe(3);
    });

    it("counts 'a' as 1 syllable", () => {
      expect(countSyllables("a")).toBe(1);
    });

    it("counts 'I' as 1 syllable", () => {
      expect(countSyllables("I")).toBe(1);
    });

    it("counts 'extraordinary' correctly", () => {
      // ex-traor-di-na-ry = 5 (or 6 depending on dialect)
      const result = countSyllables("extraordinary");
      expect(result).toBeGreaterThanOrEqual(5);
      expect(result).toBeLessThanOrEqual(6);
    });

    it("counts 'simple' as 2 syllables", () => {
      expect(countSyllables("simple")).toBe(2);
    });

    it("returns at least 1 for any non-empty word", () => {
      expect(countSyllables("xyz")).toBeGreaterThanOrEqual(1);
    });
  });

  describe("analyzeReadability()", () => {
    it("returns null for empty text", () => {
      expect(analyzeReadability(EMPTY)).toBeNull();
    });

    it("returns null for whitespace only", () => {
      expect(analyzeReadability(WHITESPACE_ONLY)).toBeNull();
    });

    it("produces a result for a simple sentence", () => {
      const result = analyzeReadability(SIMPLE_SENTENCE);
      expect(result).not.toBeNull();
      expect(result!.fleschKincaid).toBeDefined();
      expect(result!.colemanLiau).toBeDefined();
      expect(result!.fleschReadingEase).toBeDefined();
    });

    it("does not produce NaN or Infinity", () => {
      const result = analyzeReadability(SIMPLE_SENTENCE);
      expect(result).not.toBeNull();
      expect(Number.isFinite(result!.fleschKincaid.grade)).toBe(true);
      expect(Number.isFinite(result!.colemanLiau.grade)).toBe(true);
      expect(Number.isFinite(result!.fleschReadingEase.score)).toBe(true);
    });

    it("maps grade 5 passage to low grade level", () => {
      const result = analyzeReadability(KNOWN_GRADE_5);
      expect(result).not.toBeNull();
      // Flesch-Kincaid should be roughly grade 2-6 for simple text
      expect(result!.fleschKincaid.grade).toBeLessThanOrEqual(7);
    });

    it("maps grade 12+ passage to high grade level", () => {
      const result = analyzeReadability(KNOWN_GRADE_12);
      expect(result).not.toBeNull();
      // Academic text should be grade 12+
      expect(result!.fleschKincaid.grade).toBeGreaterThanOrEqual(12);
    });

    it("produces higher reading ease for simple text", () => {
      const simple = analyzeReadability(KNOWN_GRADE_5);
      const complex = analyzeReadability(KNOWN_GRADE_12);
      expect(simple).not.toBeNull();
      expect(complex).not.toBeNull();
      expect(simple!.fleschReadingEase.score).toBeGreaterThan(
        complex!.fleschReadingEase.score,
      );
    });

    it("includes human-readable labels", () => {
      const result = analyzeReadability(KNOWN_GRADE_5);
      expect(result).not.toBeNull();
      expect(typeof result!.fleschKincaid.label).toBe("string");
      expect(result!.fleschKincaid.label.length).toBeGreaterThan(0);
      expect(typeof result!.colemanLiau.label).toBe("string");
      expect(result!.colemanLiau.label.length).toBeGreaterThan(0);
      expect(typeof result!.fleschReadingEase.label).toBe("string");
      expect(result!.fleschReadingEase.label.length).toBeGreaterThan(0);
    });

    it("grade label matches the rounded grade value", () => {
      const result = analyzeReadability(KNOWN_GRADE_12);
      expect(result).not.toBeNull();
      const grade = result!.fleschKincaid.grade;
      const rounded = Math.round(grade);
      expect(result!.fleschKincaid.label).toContain(`Grade ${rounded}`);
    });
  });
});
