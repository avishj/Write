import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  makeDocument,
  makeVersion,
  resetFixtureCounters,
} from "@tests/fixtures/documents";

import { openDB, resetDB } from "@lib/persistence/db";
import {
  deleteDocument,
  getAllDocuments,
  getDocument,
  saveDocument,
} from "@lib/persistence/documents";
import {
  deleteVersion,
  getVersions,
  pruneAutoVersions,
  saveVersion,
} from "@lib/persistence/versions";

describe("db lifecycle", () => {
  beforeEach(() => {
    resetFixtureCounters();
  });

  afterEach(async () => {
    await resetDB();
    const dbs = await indexedDB.databases();
    for (const db of dbs) {
      if (db.name) indexedDB.deleteDatabase(db.name);
    }
  });

  describe("fresh database creation", () => {
    it("creates all object stores and indexes", async () => {
      const db = await openDB();
      expect(db.objectStoreNames.contains("documents")).toBe(true);
      expect(db.objectStoreNames.contains("versions")).toBe(true);

      // Verify indexes exist by opening a transaction
      const tx = db.transaction(["documents", "versions"], "readonly");
      const docStore = tx.objectStore("documents");
      const verStore = tx.objectStore("versions");

      expect(docStore.indexNames.contains("by-updated")).toBe(true);
      expect(verStore.indexNames.contains("by-document")).toBe(true);
      expect(verStore.indexNames.contains("by-created")).toBe(true);
      await tx.done;
    });

    it("starts with empty stores", async () => {
      const docs = await getAllDocuments();
      expect(docs).toEqual([]);
    });
  });

  describe("document + version lifecycle", () => {
    it("creates doc, adds versions, prunes, deletes doc", async () => {
      // 1. Create a document
      const doc = makeDocument({
        id: "lifecycle-doc",
        content: "Hello world",
        title: "Lifecycle Test",
      });
      await saveDocument(doc);

      // 2. Add some versions
      for (let i = 0; i < 5; i++) {
        await saveVersion(
          makeVersion({
            documentId: "lifecycle-doc",
            type: "auto",
            content: `Version ${i}`,
            wordCount: 2 + i,
            createdAt: 1000 + i * 100,
          }),
        );
      }
      await saveVersion(
        makeVersion({
          documentId: "lifecycle-doc",
          type: "manual",
          name: "Important save",
          content: "Manual version",
          wordCount: 2,
          createdAt: 5000,
        }),
      );

      // 3. Verify versions are present
      let versions = await getVersions("lifecycle-doc");
      expect(versions).toHaveLength(6);

      // 4. Prune auto versions to 3
      await pruneAutoVersions("lifecycle-doc", 3);
      versions = await getVersions("lifecycle-doc");
      // 3 auto + 1 manual = 4
      expect(versions).toHaveLength(4);
      expect(versions.filter((v) => v.type === "manual")).toHaveLength(1);

      // 5. Update document
      await saveDocument({
        ...doc,
        content: "Updated content",
        updatedAt: doc.updatedAt + 10000,
      });
      const updated = await getDocument("lifecycle-doc");
      expect(updated!.content).toBe("Updated content");

      // 6. Delete the document
      await deleteDocument("lifecycle-doc");
      const deleted = await getDocument("lifecycle-doc");
      expect(deleted).toBeUndefined();

      // Note: versions are NOT automatically deleted when document is deleted.
      // That's a higher-level concern (store/service layer responsibility).
      const orphanedVersions = await getVersions("lifecycle-doc");
      expect(orphanedVersions).toHaveLength(4);
    });

    it("handles multiple documents independently", async () => {
      const doc1 = makeDocument({ id: "doc-a", content: "Doc A" });
      const doc2 = makeDocument({ id: "doc-b", content: "Doc B" });
      await saveDocument(doc1);
      await saveDocument(doc2);

      await saveVersion(
        makeVersion({ documentId: "doc-a", createdAt: 1000 }),
      );
      await saveVersion(
        makeVersion({ documentId: "doc-a", createdAt: 2000 }),
      );
      await saveVersion(
        makeVersion({ documentId: "doc-b", createdAt: 3000 }),
      );

      const allDocs = await getAllDocuments();
      expect(allDocs).toHaveLength(2);

      const doc1Versions = await getVersions("doc-a");
      const doc2Versions = await getVersions("doc-b");
      expect(doc1Versions).toHaveLength(2);
      expect(doc2Versions).toHaveLength(1);

      // Delete doc-a, doc-b remains
      await deleteDocument("doc-a");
      const remaining = await getAllDocuments();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].id).toBe("doc-b");
    });
  });

  describe("version cleanup by document", () => {
    it("can delete all versions for a document manually", async () => {
      const docId = "cleanup-doc";
      for (let i = 0; i < 5; i++) {
        await saveVersion(
          makeVersion({ documentId: docId, createdAt: 1000 + i }),
        );
      }

      // Delete each version individually
      const versions = await getVersions(docId);
      for (const v of versions) {
        await deleteVersion(v.id);
      }

      const remaining = await getVersions(docId);
      expect(remaining).toEqual([]);
    });
  });
});
