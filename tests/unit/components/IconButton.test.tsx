// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { IconButton } from "@app/components/common/IconButton";

afterEach(cleanup);

describe("IconButton", () => {
  it("renders with aria-label", () => {
    render(
      <IconButton label="Toggle theme">
        <span>icon</span>
      </IconButton>,
    );
    expect(screen.getByRole("button", { name: "Toggle theme" })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <IconButton label="Click me" onClick={onClick}>
        <span>icon</span>
      </IconButton>,
    );
    await user.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is disabled when disabled prop is set", () => {
    render(
      <IconButton label="Disabled" disabled>
        <span>icon</span>
      </IconButton>,
    );
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows tooltip on hover", async () => {
    const user = userEvent.setup();
    render(
      <IconButton label="My tooltip" tooltipSide="top">
        <span>icon</span>
      </IconButton>,
    );

    // Tooltip should not be visible initially
    expect(screen.queryByRole("tooltip")).toBeNull();

    // Hover to trigger tooltip (with delay)
    await user.hover(screen.getByRole("button"));

    // Wait for tooltip delay (400ms default)
    await vi.waitFor(() => {
      expect(screen.getByRole("tooltip")).toBeInTheDocument();
    });

    expect(screen.getByRole("tooltip").textContent).toBe("My tooltip");
  });
});
