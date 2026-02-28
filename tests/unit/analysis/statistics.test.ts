import { describe, expect, it } from "vitest";
import { analyzeStatistics } from "@lib/analysis/statistics";
import { EMPTY, SIMPLE_SENTENCE, WHITESPACE_ONLY } from "@tests/fixtures/texts";

describe("statistics", () => {
  describe("analyzeStatistics()", () => {
    it("returns zeroed results for empty text", () => {
      const result = analyzeStatistics(EMPTY);
      expect(result.avgWordLength).toBe(0);
      expect(result.avgSentenceLength).toBe(0);
      expect(result.uniqueWordCount).toBe(0);
      expect(result.topWords).toEqual([]);
      expect(result.longestWord).toEqual({ word: "", length: 0 });
    });

    it("returns zeroed results for whitespace only", () => {
      const result = analyzeStatistics(WHITESPACE_ONLY);
      expect(result.avgWordLength).toBe(0);
      expect(result.uniqueWordCount).toBe(0);
    });

    it("calculates average word length", () => {
      // "I am a dog" → (1+2+1+3)/4 = 1.75
      const result = analyzeStatistics("I am a dog");
      expect(result.avgWordLength).toBe(1.75);
    });

    it("calculates average sentence length (words per sentence)", () => {
      const result = analyzeStatistics(SIMPLE_SENTENCE);
      // "The quick brown fox jumps over the lazy dog." = 9 words, 1 sentence
      expect(result.avgSentenceLength).toBe(9);
    });

    it("counts unique words", () => {
      // "the the cat cat dog" → 3 unique
      const result = analyzeStatistics("the the cat cat dog");
      expect(result.uniqueWordCount).toBe(3);
    });

    it("is case insensitive for unique words", () => {
      // "The the THE" → 1 unique
      const result = analyzeStatistics("The the THE");
      expect(result.uniqueWordCount).toBe(1);
    });

    it("finds the longest word", () => {
      const result = analyzeStatistics("I am extraordinarily happy");
      expect(result.longestWord.word).toBe("extraordinarily");
      expect(result.longestWord.length).toBe(15);
    });

    it("excludes stop words from top words", () => {
      // "the cat and the dog and the fish"
      // → "the" is a stop word, top word should be "cat", "dog", or "fish"
      const result = analyzeStatistics("the cat and the dog and the fish");
      const topWordTexts = result.topWords.map((w) => w.word);
      expect(topWordTexts).not.toContain("the");
      expect(topWordTexts).not.toContain("and");
    });

    it("returns correct frequency counts", () => {
      const result = analyzeStatistics(
        "cat cat cat dog dog fish bird bird bird bird",
      );
      const catEntry = result.topWords.find((w) => w.word === "cat");
      const birdEntry = result.topWords.find((w) => w.word === "bird");
      expect(catEntry?.count).toBe(3);
      expect(birdEntry?.count).toBe(4);
    });

    it("respects custom topN", () => {
      const result = analyzeStatistics(
        "cat cat cat dog dog fish bird bird bird bird",
        2,
      );
      expect(result.topWords.length).toBeLessThanOrEqual(2);
    });

    it("defaults topN to 10", () => {
      // Create text with many unique non-stop words
      const words = Array.from({ length: 20 }, (_, i) => `word${i}`);
      const text = words.map((w) => `${w} ${w}`).join(" ");
      const result = analyzeStatistics(text);
      expect(result.topWords.length).toBeLessThanOrEqual(10);
    });
  });
});
