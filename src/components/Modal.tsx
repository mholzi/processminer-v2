"use client";

import { useEffect, useRef, type ReactNode } from "react";

// The one dialog shell. Every modal in the app hand-rolled its own overlay,
// none bound Esc, trapped focus, or set aria-modal, and overlay-dismiss was
// inconsistent (design review — systemic root #4: no shared primitives → drift).
// This primitive standardises all of that. Dialogs supply a title, body, and an
// actions row; the chrome (overlay, focus trap, Esc, click-outside, restore
// focus) is handled here. Reuses the existing `.modal-*` classes so the look is
// unchanged.

const FOCUSABLE =
  'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export default function Modal({
  title,
  onClose,
  children,
  actions,
  width,
  className,
  closeOnOverlay = true,
}: {
  /** Dialog heading. Also the accessible label. */
  title?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  /** Footer button row. Rendered inside `.modal-actions`. */
  actions?: ReactNode;
  /** Optional fixed width (px). */
  width?: number;
  /** Extra class on the `.modal` panel (e.g. "admin-modal"). */
  className?: string;
  /** Whether clicking the backdrop closes (default true). */
  closeOnOverlay?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const restore = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const focusables = () =>
      panel
        ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
            (el) => el.offsetParent !== null || el === document.activeElement,
          )
        : [];
    // Focus the first field/button so keyboard users land inside the dialog.
    const t = setTimeout(() => focusables()[0]?.focus(), 0);

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const f = focusables();
        if (f.length === 0) return;
        const active = document.activeElement as HTMLElement;
        const idx = f.indexOf(active);
        if (e.shiftKey && idx <= 0) {
          e.preventDefault();
          f[f.length - 1].focus();
        } else if (!e.shiftKey && idx === f.length - 1) {
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
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      onClick={closeOnOverlay ? onClose : undefined}
    >
      <div
        ref={panelRef}
        className={`modal${className ? ` ${className}` : ""}`}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={width ? { width } : undefined}
      >
        {title != null && <div className="modal-title">{title}</div>}
        {children}
        {actions != null && <div className="modal-actions">{actions}</div>}
      </div>
    </div>
  );
}
