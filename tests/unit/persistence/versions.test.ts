import "fake-indexeddb/auto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  makeVersion,
  resetFixtureCounters,
  type StoredVersion,
} from "@tests/fixtures/documents";

/**
 * TDD — implementation does not exist yet.
 */
import {
  deleteVersion,
  getVersions,
  pruneAutoVersions,
  saveVersion,
} from "@lib/persistence/versions";

describe("version persistence", () => {
  beforeEach(() => {
    resetFixtureCounters();
  });

  afterEach(async () => {
    const dbs = await indexedDB.databases();
    for (const db of dbs) {
      if (db.name) indexedDB.deleteDatabase(db.name);
    }
  });

  describe("saveVersion + getVersions", () => {
    it("saves and retrieves versions for a document", async () => {
      const v1 = makeVersion({
        documentId: "doc-1",
        content: "First draft",
        wordCount: 2,
        createdAt: 1000,
      });
      const v2 = makeVersion({
        documentId: "doc-1",
        content: "Second draft",
        wordCount: 2,
        createdAt: 2000,
      });
      await saveVersion(v1);
      await saveVersion(v2);

      const versions = await getVersions("doc-1");
      expect(versions).toHaveLength(2);
    });

    it("returns versions ordered by createdAt descending", async () => {
      const v1 = makeVersion({ documentId: "doc-1", createdAt: 1000 });
      const v2 = makeVersion({ documentId: "doc-1", createdAt: 3000 });
      const v3 = makeVersion({ documentId: "doc-1", createdAt: 2000 });
      await saveVersion(v1);
      await saveVersion(v2);
      await saveVersion(v3);

      const versions = await getVersions("doc-1");
      expect(versions[0].createdAt).toBe(3000);
      expect(versions[1].createdAt).toBe(2000);
      expect(versions[2].createdAt).toBe(1000);
    });

    it("only returns versions for the requested document", async () => {
      const v1 = makeVersion({ documentId: "doc-1" });
      const v2 = makeVersion({ documentId: "doc-2" });
      await saveVersion(v1);
      await saveVersion(v2);

      const doc1Versions = await getVersions("doc-1");
      expect(doc1Versions).toHaveLength(1);
      expect(doc1Versions[0].documentId).toBe("doc-1");

      const doc2Versions = await getVersions("doc-2");
      expect(doc2Versions).toHaveLength(1);
      expect(doc2Versions[0].documentId).toBe("doc-2");
    });

    it("returns empty array for document with no versions", async () => {
      const versions = await getVersions("no-versions");
      expect(versions).toEqual([]);
    });

    it("stores manual version with name", async () => {
      const v = makeVersion({
        type: "manual",
        name: "Final draft",
        documentId: "doc-1",
      });
      await saveVersion(v);

      const versions = await getVersions("doc-1");
      expect(versions[0].type).toBe("manual");
      expect(versions[0].name).toBe("Final draft");
    });
  });

  describe("deleteVersion", () => {
    it("removes a specific version", async () => {
      const v1 = makeVersion({ documentId: "doc-1" });
      const v2 = makeVersion({ documentId: "doc-1" });
      await saveVersion(v1);
      await saveVersion(v2);

      await deleteVersion(v1.id);

      const versions = await getVersions("doc-1");
      expect(versions).toHaveLength(1);
      expect(versions[0].id).toBe(v2.id);
    });

    it("does not throw when deleting non-existent version", async () => {
      await expect(deleteVersion("non-existent")).resolves.not.toThrow();
    });
  });

  describe("pruneAutoVersions", () => {
    it("removes oldest auto versions beyond maxCount", async () => {
      // Create 60 auto versions with increasing timestamps
      const versions: StoredVersion[] = [];
      for (let i = 0; i < 60; i++) {
        versions.push(
          makeVersion({
            documentId: "doc-1",
            type: "auto",
            createdAt: 1000 + i * 100,
            content: `Version ${i}`,
          }),
        );
      }
      for (const v of versions) {
        await saveVersion(v);
      }

      await pruneAutoVersions("doc-1", 50);

      const remaining = await getVersions("doc-1");
      expect(remaining).toHaveLength(50);

      // The 10 oldest should have been removed
      // Remaining should be the 50 newest (highest createdAt)
      const timestamps = remaining.map((v: StoredVersion) => v.createdAt);
      for (let i = 0; i < 10; i++) {
        expect(timestamps).not.toContain(1000 + i * 100);
      }
    });

    it("preserves manual versions during pruning", async () => {
      // Create 30 auto + 10 manual versions
      for (let i = 0; i < 30; i++) {
        await saveVersion(
          makeVersion({
            documentId: "doc-1",
            type: "auto",
            createdAt: 1000 + i * 100,
          }),
        );
      }
      for (let i = 0; i < 10; i++) {
        await saveVersion(
          makeVersion({
            documentId: "doc-1",
            type: "manual",
            name: `Manual ${i}`,
            createdAt: 500 + i * 100,
          }),
        );
      }

      // Prune auto to 20 — should remove 10 oldest auto, keep all manual
      await pruneAutoVersions("doc-1", 20);

      const remaining = await getVersions("doc-1");
      const manualCount = remaining.filter(
        (v: StoredVersion) => v.type === "manual",
      ).length;
      const autoCount = remaining.filter(
        (v: StoredVersion) => v.type === "auto",
      ).length;

      expect(manualCount).toBe(10);
      expect(autoCount).toBe(20);
    });

    it("does nothing when auto count is within limit", async () => {
      for (let i = 0; i < 5; i++) {
        await saveVersion(
          makeVersion({ documentId: "doc-1", type: "auto" }),
        );
      }

      await pruneAutoVersions("doc-1", 50);

      const remaining = await getVersions("doc-1");
      expect(remaining).toHaveLength(5);
    });

    it("only prunes versions for the specified document", async () => {
      for (let i = 0; i < 5; i++) {
        await saveVersion(
          makeVersion({ documentId: "doc-1", type: "auto", createdAt: 1000 + i }),
        );
      }
      for (let i = 0; i < 3; i++) {
        await saveVersion(
          makeVersion({ documentId: "doc-2", type: "auto", createdAt: 2000 + i }),
        );
      }

      await pruneAutoVersions("doc-1", 2);

      const doc1Versions = await getVersions("doc-1");
      const doc2Versions = await getVersions("doc-2");
      expect(doc1Versions).toHaveLength(2);
      expect(doc2Versions).toHaveLength(3); // untouched
    });
  });
});
