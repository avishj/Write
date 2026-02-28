/**
 * Document CRUD operations backed by IndexedDB.
 *
 * All functions open a fresh DB connection per call.
 * The `idb` library handles connection pooling internally.
 */

import { openDB, type StoredDocument } from "@lib/persistence/db";

/** Retrieve all documents, ordered by updatedAt descending. */
export async function getAllDocuments(): Promise<StoredDocument[]> {
  const db = await openDB();
  try {
    const all = await db.getAllFromIndex("documents", "by-updated");
    // getAllFromIndex returns ascending by index; reverse for newest-first
    return all.reverse();
  } finally {
    db.close();
  }
}

/** Retrieve a single document by id. Returns undefined if not found. */
export async function getDocument(
  id: string,
): Promise<StoredDocument | undefined> {
  const db = await openDB();
  try {
    return await db.get("documents", id);
  } finally {
    db.close();
  }
}

/**
 * Save (create or update) a document.
 * Uses `put` which inserts or replaces by primary key.
 */
export async function saveDocument(doc: StoredDocument): Promise<void> {
  const db = await openDB();
  try {
    await db.put("documents", doc);
  } finally {
    db.close();
  }
}

/** Delete a document by id. No-op if the document doesn't exist. */
export async function deleteDocument(id: string): Promise<void> {
  const db = await openDB();
  try {
    await db.delete("documents", id);
  } finally {
    db.close();
  }
}
