"use client";

// Fixed bar on the print/export view — the only interactive bit of the
// document. Hidden in the printed output via @media print.
export default function PrintToolbar() {
  return (
    <div className="print-toolbar">
      <button
        type="button"
        className="print-toolbar-btn"
        onClick={() => window.print()}
      >
        Print / Save as PDF
      </button>
      <span className="print-toolbar-tip">
        In the print dialog choose “Save as PDF”, and turn off the browser’s own
        headers &amp; footers.
      </span>
    </div>
  );
}
