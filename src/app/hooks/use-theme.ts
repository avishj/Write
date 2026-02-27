import { useCallback, useSyncExternalStore } from "react";
import {
  type StorageBackend,
  defaultSettings,
  loadSettings,
  saveSetting,
} from "@lib/persistence/settings";

type Theme = "dark" | "light";

/** Detect system preference via matchMedia */
function getSystemTheme(): Theme {
  if (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-color-scheme: light)").matches
  ) {
    return "light";
  }
  return "dark";
}

/** Resolve the initial theme: persisted > system > default */
function resolveInitialTheme(storage?: StorageBackend): Theme {
  const settings = loadSettings(storage);
  // If nothing was persisted, the default from loadSettings is "dark".
  // But we want to respect the system preference as fallback.
  // Check if a theme was explicitly persisted by looking at storage directly.
  const store = storage ?? window.localStorage;
  const persisted = store.getItem("count-theme");
  if (persisted !== null) {
    return settings.theme;
  }
  return getSystemTheme();
}

/** Apply data-theme attribute to <html> */
function applyTheme(theme: Theme): void {
  if (typeof document !== "undefined") {
    document.documentElement.setAttribute("data-theme", theme);
  }
}

// --- Module-level state for useSyncExternalStore ---
let currentTheme: Theme = "dark";
let currentStorage: StorageBackend | undefined;
const listeners = new Set<() => void>();

function emitChange(): void {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): Theme {
  return currentTheme;
}

/**
 * Initialize the theme system. Call once at app startup.
 * @param storage — optional storage backend override (for testing)
 */
export function initTheme(storage?: StorageBackend): void {
  currentStorage = storage;
  currentTheme = resolveInitialTheme(storage);
  applyTheme(currentTheme);
}

/**
 * Hook: read and toggle theme.
 *
 * Uses useSyncExternalStore for tear-free reads.
 * On toggle, persists to storage and applies data-theme attribute.
 */
export function useTheme(): {
  theme: Theme;
  toggleTheme: () => void;
} {
  const theme = useSyncExternalStore(subscribe, getSnapshot, (): Theme => "dark");

  const toggleTheme = useCallback(() => {
    const next: Theme = currentTheme === "dark" ? "light" : "dark";
    currentTheme = next;
    saveSetting("theme", next, currentStorage);
    applyTheme(next);
    emitChange();
  }, []);

  return { theme, toggleTheme };
}
