import {
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
  type KeyboardEvent,
} from "react";

interface ModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Called when the modal should close */
  onClose: () => void;
  /** Modal title (for aria-labelledby) */
  title: string;
  /** Modal content */
  children: ReactNode;
}

/**
 * Modal — accessible dialog with backdrop, focus trap, and esc to close.
 *
 * Uses the native <dialog> element for built-in accessibility.
 * Animations: scale from 0.97 + fade-in (200ms ease-out).
 */
export function Modal({ open, onClose, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Sync open state with the <dialog> element
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Close on backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        onClose();
      }
    },
    [onClose],
  );

  // Close on Escape (native dialog handles this, but we need to sync state)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDialogElement>) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [onClose],
  );

  // Handle native close event (e.g. from Escape key when we don't prevent)
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      if (open) onClose();
    };

    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onKeyDown={handleKeyDown}
      onClick={handleBackdropClick}
      aria-labelledby="modal-title"
      className="m-auto max-h-[85vh] w-full max-w-lg rounded-lg border p-0 backdrop:bg-transparent"
      style={{
        backgroundColor: "var(--bg-surface)",
        borderColor: "var(--border)",
        color: "var(--text-primary)",
      }}
    >
      {/* Backdrop overlay — rendered inside dialog::backdrop doesn't support CSS vars */}
      <div
        className="fixed inset-0 -z-10"
        style={{ backgroundColor: "var(--bg-overlay)" }}
        aria-hidden="true"
      />

      <div className="flex flex-col">
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: "var(--border-subtle)" }}
        >
          <h2
            id="modal-title"
            className="text-base font-semibold font-ui"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex h-7 w-7 items-center justify-center rounded transition-colors duration-100 hover:bg-[var(--bg-elevated)]"
            style={{ color: "var(--text-secondary)" }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M1 1L13 13M1 13L13 1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-5 py-4">
          {children}
        </div>
      </div>
    </dialog>
  );
}
