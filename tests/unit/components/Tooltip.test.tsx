// @vitest-environment jsdom
import { cleanup, render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Tooltip } from "@app/components/common/Tooltip";

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe("Tooltip", () => {
  it("does not show tooltip initially", () => {
    render(
      <Tooltip content="Help text">
        <button>Hover me</button>
      </Tooltip>,
    );
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("shows tooltip on hover after delay", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Help text" delay={200}>
        <button>Hover me</button>
      </Tooltip>,
    );
    await user.hover(screen.getByText("Hover me"));
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByRole("tooltip")).toBeDefined();
    expect(screen.getByText("Help text")).toBeDefined();
  });

  it("hides tooltip on mouse leave", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Help text" delay={200}>
        <button>Hover me</button>
      </Tooltip>,
    );
    await user.hover(screen.getByText("Hover me"));
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByRole("tooltip")).toBeDefined();

    await user.unhover(screen.getByText("Hover me"));
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("does not show tooltip before delay elapses", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Help text" delay={400}>
        <button>Hover me</button>
      </Tooltip>,
    );
    await user.hover(screen.getByText("Hover me"));
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("shows tooltip on focus", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <Tooltip content="Keyboard tip" delay={200}>
        <button>Focus me</button>
      </Tooltip>,
    );
    await user.tab();
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByRole("tooltip")).toBeDefined();
    expect(screen.getByText("Keyboard tip")).toBeDefined();
  });

  it("supports different sides", async () => {
    const sides = ["top", "left", "right"] as const;
    const expectedStyles: Record<string, string> = {
      top: "bottom",
      left: "right",
      right: "left",
    };

    for (const side of sides) {
      cleanup();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(
        <Tooltip content={`${side} tip`} side={side} delay={0}>
          <button>Target</button>
        </Tooltip>,
      );
      await user.hover(screen.getByText("Target"));
      await act(async () => {
        vi.advanceTimersByTime(10);
      });
      const tooltip = screen.getByRole("tooltip");
      expect(tooltip).toBeInTheDocument();
      expect(tooltip.style[expectedStyles[side] as never]).toBe("100%");
      await user.unhover(screen.getByText("Target"));
    }
  });
});
