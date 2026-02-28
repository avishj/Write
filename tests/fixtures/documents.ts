/**
 * Factory helpers for creating test documents and versions.
 */

import type { LimitType } from "@lib/analysis/overflow";

export interface StoredDocument {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  limit?: {
    type: LimitType;
    value: number;
  };
}

export interface StoredVersion {
  id: string;
  documentId: string;
  content: string;
  wordCount: number;
  createdAt: number;
  type: "auto" | "manual";
  name?: string;
}

let docCounter = 0;
let versionCounter = 0;

/** Create a test document with sensible defaults */
export function makeDocument(
  overrides?: Partial<StoredDocument>,
): StoredDocument {
  docCounter += 1;
  const now = Date.now();
  return {
    id: overrides?.id ?? `doc-${docCounter}`,
    title: overrides?.title ?? `Untitled ${docCounter}`,
    content: overrides?.content ?? "",
    createdAt: overrides?.createdAt ?? now,
    updatedAt: overrides?.updatedAt ?? now,
    ...("limit" in (overrides ?? {}) ? { limit: overrides!.limit } : {}),
  };
}

/** Create a test version with sensible defaults */
export function makeVersion(
  overrides?: Partial<StoredVersion>,
): StoredVersion {
  versionCounter += 1;
  return {
    id: overrides?.id ?? `ver-${versionCounter}`,
    documentId: overrides?.documentId ?? "doc-1",
    content: overrides?.content ?? "",
    wordCount: overrides?.wordCount ?? 0,
    createdAt: overrides?.createdAt ?? Date.now(),
    type: overrides?.type ?? "auto",
    ...(overrides?.name !== undefined ? { name: overrides.name } : {}),
  };
}

/** Reset counters between test files */
export function resetFixtureCounters(): void {
  docCounter = 0;
  versionCounter = 0;
}
