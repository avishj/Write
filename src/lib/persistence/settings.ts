/**
 * Settings persistence — localStorage read/write
 *
 * Most settings are stored under their own key. Related settings
 * (sidebar, bottomPanel) share compound keys with read-modify-write.
 *
 * Storage backend is injectable for testing.
 */

export interface UserSettings {
  theme: "dark" | "light";
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  bottomPanelOpen: boolean;
  bottomPanelTab: "details" | "limits" | "history";
  focusMode: boolean;
  charsIncludeSpaces: boolean;
}

export const defaultSettings: UserSettings = {
  theme: "dark",
  sidebarCollapsed: false,
  sidebarWidth: 220,
  bottomPanelOpen: true,
  bottomPanelTab: "details",
  focusMode: false,
  charsIncludeSpaces: true,
};

/** Minimal storage interface (subset of Web Storage API) */
export interface StorageBackend {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/** localStorage key prefix */
const PREFIX = "count";

/** Map each setting to its localStorage key */
const keyMap: Record<keyof UserSettings, string> = {
  theme: `${PREFIX}-theme`,
  sidebarCollapsed: `${PREFIX}-sidebar`,
  sidebarWidth: `${PREFIX}-sidebar`,
  bottomPanelOpen: `${PREFIX}-bottom-panel`,
  bottomPanelTab: `${PREFIX}-bottom-panel`,
  focusMode: `${PREFIX}-focus-mode`,
  charsIncludeSpaces: `${PREFIX}-chars-spaces`,
};

/** Validation for each setting */
const validators: Record<keyof UserSettings, (v: unknown) => boolean> = {
  theme: (v) => v === "dark" || v === "light",
  sidebarCollapsed: (v) => typeof v === "boolean",
  sidebarWidth: (v) => typeof v === "number" && v >= 48 && v <= 320,
  bottomPanelOpen: (v) => typeof v === "boolean",
  bottomPanelTab: (v) => v === "details" || v === "limits" || v === "history",
  focusMode: (v) => typeof v === "boolean",
  charsIncludeSpaces: (v) => typeof v === "boolean",
};

function getStorage(storage?: StorageBackend): StorageBackend {
  return storage ?? window.localStorage;
}

function readKey(store: StorageBackend, key: string): unknown {
  try {
    const raw = store.getItem(key);
    if (raw === null) return undefined;
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

/**
 * Load all settings, falling back to defaults for missing or invalid values.
 * @param storage — override for testing; defaults to window.localStorage
 */
export function loadSettings(storage?: StorageBackend): UserSettings {
  const store = getStorage(storage);
  const settings = { ...defaultSettings };

  // Theme
  const theme = readKey(store, keyMap.theme);
  if (validators.theme(theme)) {
    settings.theme = theme as UserSettings["theme"];
  }

  // Sidebar (stored as compound object)
  const sidebar = readKey(store, keyMap.sidebarCollapsed);
  if (sidebar && typeof sidebar === "object") {
    const s = sidebar as Record<string, unknown>;
    if (validators.sidebarCollapsed(s.collapsed)) {
      settings.sidebarCollapsed = s.collapsed as boolean;
    }
    if (validators.sidebarWidth(s.width)) {
      settings.sidebarWidth = s.width as number;
    }
  }

  // Bottom panel (stored as compound object)
  const bottom = readKey(store, keyMap.bottomPanelOpen);
  if (bottom && typeof bottom === "object") {
    const b = bottom as Record<string, unknown>;
    if (validators.bottomPanelOpen(b.open)) {
      settings.bottomPanelOpen = b.open as boolean;
    }
    if (validators.bottomPanelTab(b.tab)) {
      settings.bottomPanelTab = b.tab as UserSettings["bottomPanelTab"];
    }
  }

  // Focus mode
  const focus = readKey(store, keyMap.focusMode);
  if (validators.focusMode(focus)) {
    settings.focusMode = focus as boolean;
  }

  // Chars include spaces
  const chars = readKey(store, keyMap.charsIncludeSpaces);
  if (validators.charsIncludeSpaces(chars)) {
    settings.charsIncludeSpaces = chars as boolean;
  }

  return settings;
}

/**
 * Save a single setting.
 * Compound keys (sidebar, bottomPanel) do a read-modify-write
 * on their shared storage entry.
 * @param storage — override for testing; defaults to window.localStorage
 */
export function saveSetting<K extends keyof UserSettings>(
  key: K,
  value: UserSettings[K],
  storage?: StorageBackend,
): void {
  const store = getStorage(storage);

  switch (key) {
    case "theme":
      store.setItem(keyMap.theme, JSON.stringify(value));
      break;

    case "sidebarCollapsed":
    case "sidebarWidth": {
      const current = readKey(store, keyMap.sidebarCollapsed) ?? {};
      const obj =
        typeof current === "object" && current !== null ? current : {};
      const merged = {
        ...(obj as Record<string, unknown>),
        [key === "sidebarCollapsed" ? "collapsed" : "width"]: value,
      };
      store.setItem(keyMap.sidebarCollapsed, JSON.stringify(merged));
      break;
    }

    case "bottomPanelOpen":
    case "bottomPanelTab": {
      const current = readKey(store, keyMap.bottomPanelOpen) ?? {};
      const obj =
        typeof current === "object" && current !== null ? current : {};
      const merged = {
        ...(obj as Record<string, unknown>),
        [key === "bottomPanelOpen" ? "open" : "tab"]: value,
      };
      store.setItem(keyMap.bottomPanelOpen, JSON.stringify(merged));
      break;
    }

    case "focusMode":
      store.setItem(keyMap.focusMode, JSON.stringify(value));
      break;

    case "charsIncludeSpaces":
      store.setItem(keyMap.charsIncludeSpaces, JSON.stringify(value));
      break;
  }
}
