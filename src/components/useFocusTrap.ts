"use client";

import { useEffect, type RefObject } from "react";

const FOCUSABLE =
  'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

// Dialog/overlay accessibility, shared by Modal and the help/command overlays so
// every dialog behaves the same (design review root #4): trap Tab focus inside
// `ref`, move focus in on open (unless an autoFocus field already has it), close
// on Esc, and restore focus to the trigger on unmount.
export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  onEscape: () => void,
  /** Engage the trap only while true. Default true (for dialogs mounted only
   *  when shown, e.g. Modal). Pass an `open` flag for always-mounted overlays. */
  active = true,
) {
  useEffect(() => {
    if (!active) return;
    const restore = document.activeElement as HTMLElement | null;
    const node = ref.current;
    if (!node) return;
    const focusables = () =>
      node
        ? Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
            (el) => el.offsetParent !== null || el === document.activeElement,
          )
        : [];
    const t = setTimeout(() => {
      if (node && !node.contains(document.activeElement)) {
        focusables()[0]?.focus();
      }
    }, 0);

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onEscape();
        return;
      }
      if (e.key === "Tab") {
        const f = focusables();
        if (f.length === 0) return;
        const i = f.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && i <= 0) {
          e.preventDefault();
          f[f.length - 1].focus();
        } else if (!e.shiftKey && i === f.length - 1) {
          e.preventDefault();
          f[0].focus();
        }
      }
    }
    document.addEventListener("keydown", onKey, true);
    return () => {
      clearTimeout(t);
      document.removeEventListener("keydown", onKey, true);
      restore?.focus?.();
    };
  }, [ref, onEscape, active]);
}
