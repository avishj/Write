import { useEffect, type ReactNode } from "react";
import { type StorageBackend } from "@lib/persistence/settings";
import { initTheme } from "@app/hooks/use-theme";

interface ThemeProviderProps {
  children: ReactNode;
  /** Override storage backend (for testing) */
  storage?: StorageBackend;
}

/**
 * ThemeProvider — initializes the theme system on mount.
 *
 * Place at the root of the React tree. Child components
 * use the `useTheme()` hook to read/toggle theme.
 */
export function ThemeProvider({ children, storage }: ThemeProviderProps) {
  useEffect(() => {
    initTheme(storage);
  }, [storage]);

  return <>{children}</>;
}
