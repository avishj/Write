/**
 * Document CRUD operations backed by IndexedDB.
 *
 * Uses the shared singleton DB connection from db.ts.
 */

import { openDB, type StoredDocument } from "@lib/persistence/db";

/** Retrieve all documents, ordered by updatedAt descending. */
export async function getAllDocuments(): Promise<StoredDocument[]> {
  const db = await openDB();
  const all = await db.getAllFromIndex("documents", "by-updated");
  // getAllFromIndex returns ascending by index; reverse for newest-first
  return all.reverse();
}

/** Retrieve a single document by id. Returns undefined if not found. */
export async function getDocument(
  id: string,
): Promise<StoredDocument | undefined> {
  const db = await openDB();
  return db.get("documents", id);
}

/**
 * Save (create or update) a document.
 * Uses `put` which inserts or replaces by primary key.
 */
export async function saveDocument(doc: StoredDocument): Promise<void> {
  const db = await openDB();
  await db.put("documents", doc);
}

/** Delete a document by id. No-op if the document doesn't exist. */
export async function deleteDocument(id: string): Promise<void> {
  const db = await openDB();
  await db.delete("documents", id);
}
