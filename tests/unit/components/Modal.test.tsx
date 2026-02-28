// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { Modal } from "@app/components/common/Modal";

afterEach(cleanup);

// jsdom doesn't implement HTMLDialogElement.showModal/close natively
// We need to polyfill them for tests
beforeAll(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute("open", "");
      Object.defineProperty(this, "open", { value: true, writable: true });
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute("open");
      Object.defineProperty(this, "open", { value: false, writable: true });
    };
  }
});

describe("Modal", () => {
  it("renders nothing when closed", () => {
    render(
      <Modal open={false} onClose={() => {}} title="Test Modal">
        <p>Content</p>
      </Modal>,
    );
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("renders dialog when open", () => {
    render(
      <Modal open={true} onClose={() => {}} title="Test Modal">
        <p>Content</p>
      </Modal>,
    );
    expect(screen.getByRole("dialog")).toBeDefined();
  });

  it("displays the title", () => {
    render(
      <Modal open={true} onClose={() => {}} title="My Modal Title">
        <p>Content</p>
      </Modal>,
    );
    expect(screen.getByText("My Modal Title")).toBeDefined();
  });

  it("displays children content", () => {
    render(
      <Modal open={true} onClose={() => {}} title="Test">
        <p>Hello World</p>
      </Modal>,
    );
    expect(screen.getByText("Hello World")).toBeDefined();
  });

  it("calls onClose when close button clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Test">
        <p>Content</p>
      </Modal>,
    );
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("calls onClose on Escape key", () => {
    const onClose = vi.fn();
    render(
      <Modal open={true} onClose={onClose} title="Test">
        <p>Content</p>
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    dialog.dispatchEvent(new Event("cancel", { bubbles: true }));
    expect(onClose).toHaveBeenCalled();
  });

  it("has aria-labelledby pointing to title", () => {
    render(
      <Modal open={true} onClose={() => {}} title="Accessible Title">
        <p>Content</p>
      </Modal>,
    );
    const dialog = screen.getByRole("dialog");
    const titleEl = screen.getByText("Accessible Title");
    const labelledBy = dialog.getAttribute("aria-labelledby");
    expect(labelledBy).toBeDefined();
    expect(titleEl.id).toBe(labelledBy);
  });
});
