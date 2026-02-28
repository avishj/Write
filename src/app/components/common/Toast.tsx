import { useSyncExternalStore, useCallback, type ReactNode } from "react";

/** Toast configuration options */
interface ToastOptions {
  /** Auto-dismiss duration in ms (default: 3500) */
  duration?: number;
}

interface ToastEntry {
  id: number;
  message: string;
  duration: number;
}

// ── Module-level store ──────────────────────────────────────────────

let nextId = 0;
let toasts: ToastEntry[] = [];
const listeners = new Set<() => void>();
const timers = new Map<number, ReturnType<typeof setTimeout>>();

function getSnapshot(): ToastEntry[] {
  return toasts;
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notify() {
  for (const cb of listeners) cb();
}

function removeToast(id: number) {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

// ── Public API ──────────────────────────────────────────────────────

/** Reset all toasts (for testing only). */
export function clearToasts() {
  for (const timer of timers.values()) clearTimeout(timer);
  timers.clear();
  toasts = [];
  notify();
}

/**
 * Show a toast notification.
 *
 * @param message — text to display
 * @param options — optional config (duration)
 */
export function toast(message: string, options?: ToastOptions) {
  const duration = options?.duration ?? 3500;
  const id = nextId++;
  const entry: ToastEntry = { id, message, duration };

  toasts = [...toasts, entry];
  notify();

  const timer = setTimeout(() => removeToast(id), duration);
  timers.set(id, timer);
}

// ── Components ──────────────────────────────────────────────────────

/**
 * ToastContainer — renders the toast stack.
 * Place once at the app root (inside AppShell).
 */
export function ToastContainer() {
  const entries = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  if (entries.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col gap-2"
    >
      {entries.map((entry) => (
        <ToastItem
          key={entry.id}
          entry={entry}
          onDismiss={() => removeToast(entry.id)}
        />
      ))}
    </div>
  );
}

function ToastItem({
  entry,
  onDismiss,
}: {
  entry: ToastEntry;
  onDismiss: () => void;
}) {
  return (
    <div
      role="status"
      onClick={onDismiss}
      className="pointer-events-auto cursor-pointer rounded-lg border px-4 py-3 text-sm font-ui shadow-lg"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border)",
        color: "var(--text-primary)",
      }}
    >
      {entry.message}
    </div>
  );
}
