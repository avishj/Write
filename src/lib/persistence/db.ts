/**
 * IndexedDB setup and schema definition.
 *
 * Uses the `idb` library for typed, promise-based IndexedDB access.
 * Migration logic is handled inline via the `upgrade` callback.
 *
 * Database: "write-db"
 * Stores:
 *   - documents: primary key "id", index "by-updated" on "updatedAt"
 *   - versions: primary key "id", indexes "by-document" on "documentId", "by-created" on "createdAt"
 */

import type { DBSchema, IDBPDatabase } from "idb";
import { openDB as idbOpenDB } from "idb";
import type { LimitType } from "@lib/analysis/overflow";

/** Shape of a stored document record */
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

/** Shape of a stored version record */
export interface StoredVersion {
  id: string;
  documentId: string;
  content: string;
  wordCount: number;
  createdAt: number;
  type: "auto" | "manual";
  name?: string;
}

/** Typed schema for the write-db database */
export interface WriteDBSchema extends DBSchema {
  documents: {
    key: string;
    value: StoredDocument;
    indexes: {
      "by-updated": number;
    };
  };
  versions: {
    key: string;
    value: StoredVersion;
    indexes: {
      "by-document": string;
      "by-created": number;
    };
  };
}

const DB_NAME = "write-db";
const DB_VERSION = 1;

/** Cached database connection promise (singleton). */
let dbPromise: Promise<IDBPDatabase<WriteDBSchema>> | null = null;

/**
 * Get the shared write-db connection.
 *
 * On first call, opens the database and runs migrations.
 * Subsequent calls return the cached promise. The connection
 * is long-lived — IndexedDB connections are designed to stay open.
 */
export function openDB(): Promise<IDBPDatabase<WriteDBSchema>> {
  if (!dbPromise) {
    dbPromise = idbOpenDB<WriteDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        // v0 → v1: initial schema
        if (oldVersion < 1) {
          const docStore = db.createObjectStore("documents", {
            keyPath: "id",
          });
          docStore.createIndex("by-updated", "updatedAt");

          const verStore = db.createObjectStore("versions", {
            keyPath: "id",
          });
          verStore.createIndex("by-document", "documentId");
          verStore.createIndex("by-created", "createdAt");
        }

        // Future migrations go here:
        // if (oldVersion < 2) { ... }
      },
    });
  }
  return dbPromise;
}

/**
 * Close the cached connection and clear the singleton.
 * Used in tests to ensure a fresh database after IndexedDB cleanup.
 */
export async function resetDB(): Promise<void> {
  if (dbPromise) {
    const db = await dbPromise;
    db.close();
    dbPromise = null;
  }
}
