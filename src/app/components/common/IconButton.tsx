import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Tooltip } from "./Tooltip";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Accessible label (also used as tooltip text) */
  label: string;
  /** Icon element */
  children: ReactNode;
  /** Tooltip placement */
  tooltipSide?: "top" | "bottom" | "left" | "right";
  /** Visual variant */
  variant?: "default" | "accent";
  /** Size */
  size?: "sm" | "md";
}

/**
 * IconButton — accessible icon button with built-in tooltip.
 * Uses aria-label for screen readers and a Tooltip for sighted users.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      label,
      children,
      tooltipSide = "bottom",
      variant = "default",
      size = "md",
      className = "",
      ...props
    },
    ref,
  ) {
    const sizeClasses = size === "sm" ? "h-7 w-7" : "h-8 w-8";

    const variantClasses =
      variant === "accent"
        ? "text-[var(--accent)] hover:bg-[var(--accent-muted)]"
        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]";

    return (
      <Tooltip content={label} side={tooltipSide}>
        <button
          ref={ref}
          {...props}
          type="button"
          aria-label={label}
          className={[
            "inline-flex items-center justify-center rounded transition-colors duration-100",
            "active:scale-[0.97]",
            sizeClasses,
            variantClasses,
            className,
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {children}
        </button>
      </Tooltip>
    );
  },
);
