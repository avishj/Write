import { beforeEach, describe, expect, it } from "vitest";
import {
  type StorageBackend,
  defaultSettings,
  loadSettings,
  saveSetting,
} from "@lib/persistence/settings";

/** Simple in-memory storage backend for tests */
function createMockStorage(): StorageBackend & { data: Map<string, string> } {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
    removeItem: (key: string) => {
      data.delete(key);
    },
  };
}

describe("settings persistence", () => {
  let storage: ReturnType<typeof createMockStorage>;

  beforeEach(() => {
    storage = createMockStorage();
  });

  describe("loadSettings", () => {
    it("returns defaults when nothing is stored", () => {
      const settings = loadSettings(storage);
      expect(settings).toEqual(defaultSettings);
    });

    it("loads a saved theme", () => {
      storage.setItem("write-theme", JSON.stringify("light"));
      const settings = loadSettings(storage);
      expect(settings.theme).toBe("light");
    });

    it("loads saved sidebar state", () => {
      storage.setItem(
        "write-sidebar",
        JSON.stringify({ collapsed: true, width: 200 }),
      );
      const settings = loadSettings(storage);
      expect(settings.sidebarCollapsed).toBe(true);
      expect(settings.sidebarWidth).toBe(200);
    });

    it("falls back to defaults for corrupt data", () => {
      storage.setItem("write-theme", "not-valid-json{{{");
      const settings = loadSettings(storage);
      expect(settings.theme).toBe(defaultSettings.theme);
    });

    it("falls back to defaults for invalid values", () => {
      storage.setItem("write-theme", JSON.stringify("blue"));
      const settings = loadSettings(storage);
      expect(settings.theme).toBe(defaultSettings.theme);
    });
  });

  describe("saveSetting", () => {
    it("saves and loads theme round-trip", () => {
      saveSetting("theme", "light", storage);
      const settings = loadSettings(storage);
      expect(settings.theme).toBe("light");
    });

    it("saves and loads sidebar collapsed state", () => {
      saveSetting("sidebarCollapsed", true, storage);
      const settings = loadSettings(storage);
      expect(settings.sidebarCollapsed).toBe(true);
    });

    it("saves and loads sidebarWidth", () => {
      saveSetting("sidebarWidth", 280, storage);
      const settings = loadSettings(storage);
      expect(settings.sidebarWidth).toBe(280);
    });

    it("saves and loads charsIncludeSpaces", () => {
      saveSetting("charsIncludeSpaces", false, storage);
      const settings = loadSettings(storage);
      expect(settings.charsIncludeSpaces).toBe(false);
    });

    it("saving one key does not affect others", () => {
      saveSetting("theme", "light", storage);
      saveSetting("sidebarCollapsed", true, storage);
      const settings = loadSettings(storage);
      expect(settings.theme).toBe("light");
      expect(settings.sidebarCollapsed).toBe(true);
      expect(settings.sidebarWidth).toBe(defaultSettings.sidebarWidth);
    });

    it("saves and loads focusMode", () => {
      saveSetting("focusMode", true, storage);
      const settings = loadSettings(storage);
      expect(settings.focusMode).toBe(true);
    });

    it("saves and loads bottomPanelOpen", () => {
      saveSetting("bottomPanelOpen", false, storage);
      const settings = loadSettings(storage);
      expect(settings.bottomPanelOpen).toBe(false);
    });

    it("saves and loads bottomPanelTab", () => {
      saveSetting("bottomPanelTab", "limits", storage);
      const settings = loadSettings(storage);
      expect(settings.bottomPanelTab).toBe("limits");
    });
  });
});
