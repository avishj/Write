// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import type { StorageBackend } from "@lib/persistence/settings";
import { initTheme, useTheme } from "@app/hooks/use-theme";

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

describe("useTheme", () => {
  let storage: ReturnType<typeof createMockStorage>;

  beforeEach(() => {
    storage = createMockStorage();
    document.documentElement.removeAttribute("data-theme");
  });

  it("defaults to dark theme when no preference stored", () => {
    initTheme(storage);
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("dark");
  });

  it("loads persisted theme from storage", () => {
    storage.setItem("write-theme", JSON.stringify("light"));
    initTheme(storage);
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe("light");
  });

  it("applies data-theme attribute on init", () => {
    initTheme(storage);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("toggles theme from dark to light", () => {
    initTheme(storage);
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("toggles theme from light to dark", () => {
    storage.setItem("write-theme", JSON.stringify("light"));
    initTheme(storage);
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("persists theme toggle to storage", () => {
    initTheme(storage);
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(storage.data.get("write-theme")).toBe(JSON.stringify("light"));
  });
});
