"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { WikiPage } from "@/lib/wiki";
import ProcessFlow from "@/components/ProcessFlow";
import RaciMatrix from "@/components/RaciMatrix";

// Visual exhibits for the export — the process flow diagram and the RACI
// matrix. They reuse the live app components; this client wrapper supplies
// the no-op handlers (a server component cannot pass event handlers) and
// scales each exhibit down to fit the page width.

const noop = () => {};

// Scales its child down so it fits the available width — the process flow is
// far wider than a page. `scrollWidth` is unaffected by the CSS transform, so
// it always reports the child's true layout width.
function ScaledExhibit({ children }: { children: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    function measure() {
      const frame = frameRef.current;
      const inner = innerRef.current;
      if (!frame || !inner) return;
      const avail = frame.clientWidth;
      const natural = inner.scrollWidth;
      const s = natural > avail && natural > 0 ? avail / natural : 1;
      setScale(s);
      setHeight(inner.scrollHeight * s);
    }
    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("beforeprint", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("beforeprint", measure);
    };
  }, []);

  return (
    <div className="print-exhibit">
      <div
        className="print-exhibit-frame"
        ref={frameRef}
        style={{ height }}
      >
        <div
          className="print-exhibit-scale"
          ref={innerRef}
          style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export default function PrintExhibits({
  steps,
  roles,
  elementIds,
  controlsByStep,
  flow,
  raci,
}: {
  steps: WikiPage[];
  roles: WikiPage[];
  elementIds: string[];
  controlsByStep: Record<string, string[]>;
  flow: boolean;
  raci: boolean;
}) {
  const knownIds = new Set(elementIds);
  const showFlow = flow && steps.length > 0;
  const showRaci = raci && steps.length > 0 && roles.length > 0;
  if (!showFlow && !showRaci) return null;

  return (
    <div className="print-exhibits">
      {showFlow && (
        <ScaledExhibit>
          <ProcessFlow
            steps={steps}
            roles={roles}
            onGoToElement={noop}
            onDeepDive={noop}
            knownIds={knownIds}
            controlsByStep={controlsByStep}
          />
        </ScaledExhibit>
      )}
      {showRaci && (
        <ScaledExhibit>
          <RaciMatrix steps={steps} roles={roles} onGoToElement={noop} />
        </ScaledExhibit>
      )}
    </div>
  );
}
