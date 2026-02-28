import { describe, expect, it } from "vitest";
import { estimateReadingTime } from "@lib/analysis/reading-time";

describe("reading-time", () => {
  describe("estimateReadingTime()", () => {
    it("returns < 1 min for 0 words", () => {
      const result = estimateReadingTime(0);
      expect(result.minutes).toBe(0);
      expect(result.label).toBe("< 1 min read");
    });

    it("returns < 1 min for 1 word", () => {
      const result = estimateReadingTime(1);
      expect(result.minutes).toBe(0);
      expect(result.label).toBe("< 1 min read");
    });

    it("returns ~1 min for 250 words (default WPM)", () => {
      const result = estimateReadingTime(250);
      expect(result.minutes).toBe(1);
      expect(result.label).toBe("~1 min read");
    });

    it("returns ~2 min for 500 words", () => {
      const result = estimateReadingTime(500);
      expect(result.minutes).toBe(2);
      expect(result.label).toBe("~2 min read");
    });

    it("returns ~3 min for 750 words", () => {
      const result = estimateReadingTime(750);
      expect(result.minutes).toBe(3);
      expect(result.label).toBe("~3 min read");
    });

    it("rounds up to nearest minute", () => {
      // 260 words at 250 WPM = 1.04 min → rounds up to 2
      const result = estimateReadingTime(260);
      expect(result.minutes).toBe(2);
    });

    it("supports custom WPM", () => {
      // 100 words at 200 WPM = 0.5 min → rounds up to 1
      const result = estimateReadingTime(100, 200);
      expect(result.minutes).toBe(1);
      expect(result.label).toBe("~1 min read");
    });

    it("shows < 1 min for very few words at any WPM", () => {
      const result = estimateReadingTime(5, 250);
      expect(result.label).toBe("< 1 min read");
    });
  });
});
