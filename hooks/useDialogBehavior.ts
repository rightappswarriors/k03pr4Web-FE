"use client";

import { useEffect, useRef } from "react";

type UseDialogBehaviorOptions = {
  isOpen: boolean;
  onClose: () => void;
  panelRef: React.RefObject<HTMLElement | null>;
};

/**
 * Shared accessible-dialog behavior: Escape-to-close, focus trap,
 * focus restoration on close, and body-scroll lock while open.
 * Assumes only one dialog using this hook is open at a time
 * (enforced by callers via a single active-modal state).
 */
export function useDialogBehavior({ isOpen, onClose, panelRef }: UseDialogBehaviorOptions) {
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [isOpen]);

  // Focus trap + initial focus + restore-on-close + Escape
  useEffect(() => {
    if (!isOpen) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;

    const getFocusable = () => {
      const panel = panelRef.current;
      if (!panel) return [];
      return Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => !el.hasAttribute("disabled"));
    };

    getFocusable()[0]?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen, onClose, panelRef]);
}