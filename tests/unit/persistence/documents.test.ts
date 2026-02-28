import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  makeDocument,
  resetFixtureCounters,
  type StoredDocument,
} from "@tests/fixtures/documents";

/**
 * TDD — implementation does not exist yet.
 */
import {
  deleteDocument,
  getAllDocuments,
  getDocument,
  saveDocument,
} from "@lib/persistence/documents";

describe("document persistence", () => {
  beforeEach(() => {
    resetFixtureCounters();
  });

  afterEach(async () => {
    // Clean up IndexedDB between tests
    const dbs = await indexedDB.databases();
    for (const db of dbs) {
      if (db.name) indexedDB.deleteDatabase(db.name);
    }
  });

  describe("saveDocument + getDocument", () => {
    it("creates and retrieves a document", async () => {
      const doc = makeDocument({ content: "Hello world" });
      await saveDocument(doc);

      const retrieved = await getDocument(doc.id);
      expect(retrieved).toBeDefined();
      expect(retrieved!.id).toBe(doc.id);
      expect(retrieved!.title).toBe(doc.title);
      expect(retrieved!.content).toBe("Hello world");
      expect(retrieved!.createdAt).toBe(doc.createdAt);
      expect(retrieved!.updatedAt).toBe(doc.updatedAt);
    });

    it("updates an existing document", async () => {
      const doc = makeDocument({ content: "Original" });
      await saveDocument(doc);

      const updated: StoredDocument = {
        ...doc,
        content: "Updated",
        updatedAt: doc.updatedAt + 1000,
      };
      await saveDocument(updated);

      const retrieved = await getDocument(doc.id);
      expect(retrieved!.content).toBe("Updated");
      expect(retrieved!.updatedAt).toBe(doc.updatedAt + 1000);
    });

    it("stores and retrieves limit configuration", async () => {
      const doc = makeDocument({
        limit: { type: "words", value: 500 },
      });
      await saveDocument(doc);

      const retrieved = await getDocument(doc.id);
      expect(retrieved!.limit).toEqual({ type: "words", value: 500 });
    });

    it("stores document without limit", async () => {
      const doc = makeDocument();
      await saveDocument(doc);

      const retrieved = await getDocument(doc.id);
      expect(retrieved!.limit).toBeUndefined();
    });
  });

  describe("deleteDocument", () => {
    it("removes a document", async () => {
      const doc = makeDocument();
      await saveDocument(doc);
      await deleteDocument(doc.id);

      const retrieved = await getDocument(doc.id);
      expect(retrieved).toBeUndefined();
    });

    it("does not throw when deleting non-existent document", async () => {
      await expect(deleteDocument("non-existent")).resolves.not.toThrow();
    });
  });

  describe("getDocument", () => {
    it("returns undefined for non-existent id", async () => {
      const retrieved = await getDocument("fake-id");
      expect(retrieved).toBeUndefined();
    });
  });

  describe("getAllDocuments", () => {
    it("returns all saved documents", async () => {
      const docs = [
        makeDocument({ content: "First" }),
        makeDocument({ content: "Second" }),
        makeDocument({ content: "Third" }),
      ];
      for (const doc of docs) {
        await saveDocument(doc);
      }

      const all = await getAllDocuments();
      expect(all).toHaveLength(3);

      const contents = all.map((d: StoredDocument) => d.content);
      expect(contents).toContain("First");
      expect(contents).toContain("Second");
      expect(contents).toContain("Third");
    });

    it("returns empty array when no documents exist", async () => {
      const all = await getAllDocuments();
      expect(all).toEqual([]);
    });
  });

  describe("concurrent operations", () => {
    it("handles two rapid saves without corruption", async () => {
      const doc = makeDocument({ content: "First" });
      await saveDocument(doc);

      // Two rapid updates
      const update1 = saveDocument({ ...doc, content: "Update 1", updatedAt: doc.updatedAt + 100 });
      const update2 = saveDocument({ ...doc, content: "Update 2", updatedAt: doc.updatedAt + 200 });
      await Promise.all([update1, update2]);

      const retrieved = await getDocument(doc.id);
      expect(retrieved).toBeDefined();
      // Last-write-wins: content and updatedAt must be consistent
      if (retrieved!.content === "Update 1") {
        expect(retrieved!.updatedAt).toBe(doc.updatedAt + 100);
      } else {
        expect(retrieved!.content).toBe("Update 2");
        expect(retrieved!.updatedAt).toBe(doc.updatedAt + 200);
      }
    });
  });
});
