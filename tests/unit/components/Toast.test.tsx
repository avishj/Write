// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ToastContainer, toast, clearToasts } from "@app/components/common/Toast";

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
  clearToasts();
  cleanup();
});

describe("Toast", () => {
  it("renders nothing when no toasts exist", () => {
    render(<ToastContainer />);
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("displays a toast message", () => {
    render(<ToastContainer />);
    act(() => {
      toast("File saved");
    });
    expect(screen.getByText("File saved")).toBeDefined();
  });

  it("has role=status for accessibility", () => {
    render(<ToastContainer />);
    act(() => {
      toast("Info message");
    });
    expect(screen.getByRole("status")).toBeDefined();
  });

  it("auto-dismisses after default duration", () => {
    render(<ToastContainer />);
    act(() => {
      toast("Temporary message");
    });
    expect(screen.getByText("Temporary message")).toBeDefined();

    // Still visible just before the 3500ms default
    act(() => {
      vi.advanceTimersByTime(3499);
    });
    expect(screen.queryByText("Temporary message")).not.toBeNull();

    // Gone at exactly 3500ms
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(screen.queryByText("Temporary message")).toBeNull();
  });

  it("supports custom duration", () => {
    render(<ToastContainer />);
    act(() => {
      toast("Short message", { duration: 1000 });
    });
    expect(screen.getByText("Short message")).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByText("Short message")).toBeNull();
  });

  it("stacks multiple toasts", () => {
    render(<ToastContainer />);
    act(() => {
      toast("First");
      toast("Second");
    });
    expect(screen.getByText("First")).toBeDefined();
    expect(screen.getByText("Second")).toBeDefined();
  });

  it("dismisses on click", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<ToastContainer />);
    act(() => {
      toast("Clickable");
    });
    const toastEl = screen.getByText("Clickable");
    await user.click(toastEl);
    expect(screen.queryByText("Clickable")).toBeNull();
  });
});
