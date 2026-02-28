/**
 * Version history CRUD operations backed by IndexedDB.
 *
 * Versions are snapshots of document content at a point in time.
 * Auto-save versions are pruned when they exceed a limit;
 * manual (named) versions are never auto-pruned.
 */

import { openDB, type StoredVersion } from "@lib/persistence/db";

/**
 * Retrieve all versions for a document, ordered by createdAt descending
 * (newest first).
 */
export async function getVersions(
  documentId: string,
): Promise<StoredVersion[]> {
  const db = await openDB();
  try {
    const all = await db.getAllFromIndex("versions", "by-document", documentId);
    // Sort by createdAt descending (newest first)
    return all.sort((a, b) => b.createdAt - a.createdAt);
  } finally {
    db.close();
  }
}

/** Save a version record. Uses `put` (insert or replace by primary key). */
export async function saveVersion(version: StoredVersion): Promise<void> {
  const db = await openDB();
  try {
    await db.put("versions", version);
  } finally {
    db.close();
  }
}

/** Delete a single version by id. No-op if the version doesn't exist. */
export async function deleteVersion(id: string): Promise<void> {
  const db = await openDB();
  try {
    await db.delete("versions", id);
  } finally {
    db.close();
  }
}

/**
 * Prune auto-save versions for a document, keeping at most `maxCount`.
 *
 * Only auto-save versions (type === "auto") are considered for pruning.
 * Manual (named) versions are always preserved.
 * The oldest auto-save versions are removed first.
 */
export async function pruneAutoVersions(
  documentId: string,
  maxCount: number,
): Promise<void> {
  const db = await openDB();
  try {
    const all = await db.getAllFromIndex(
      "versions",
      "by-document",
      documentId,
    );

    const autoVersions = all
      .filter((v) => v.type === "auto")
      .sort((a, b) => a.createdAt - b.createdAt); // oldest first

    const toDelete = autoVersions.length - maxCount;
    if (toDelete <= 0) return;

    const tx = db.transaction("versions", "readwrite");
    const store = tx.objectStore("versions");
    for (let i = 0; i < toDelete; i++) {
      await store.delete(autoVersions[i].id);
    }
    await tx.done;
  } finally {
    db.close();
  }
}
