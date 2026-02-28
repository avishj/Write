/**
 * Reading time estimation — estimated minutes to read a text.
 *
 * Pure function, no side effects.
 */

export interface ReadingTimeResult {
  minutes: number;
  label: string;
}

/**
 * Estimate reading time based on word count.
 *
 * @param wordCount — total number of words
 * @param wpm — words per minute (default 250, average adult reading speed)
 * @returns minutes (rounded up) and a human-readable label
 */
export function estimateReadingTime(
  wordCount: number,
  wpm = 250,
): ReadingTimeResult {
  if (wordCount <= 0) {
    return { minutes: 0, label: "< 1 min read" };
  }

  if (wpm <= 0) {
    throw new RangeError("wpm must be greater than 0");
  }

  const raw = wordCount / wpm;

  // Very short texts (under ~15 seconds of reading): show "< 1 min"
  if (raw < 0.25) {
    return { minutes: 0, label: "< 1 min read" };
  }

  const minutes = Math.ceil(raw);

  return {
    minutes,
    label: `~${minutes} min read`,
  };
}
