"use client";

import { useRef, type ReactNode } from "react";
import { useFocusTrap } from "./useFocusTrap";

// The one dialog shell. Every modal in the app hand-rolled its own overlay,
// none bound Esc, trapped focus, or set aria-modal, and overlay-dismiss was
// inconsistent (design review — systemic root #4: no shared primitives → drift).
// This primitive standardises all of that. Dialogs supply a title, body, and an
// actions row; the chrome (overlay, focus trap, Esc, click-outside, restore
// focus) is handled here. Reuses the existing `.modal-*` classes so the look is
// unchanged.

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
  useFocusTrap(panelRef, onClose);

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
