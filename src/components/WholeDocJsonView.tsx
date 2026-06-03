"use client";

import React from "react";
import { JsonView, defaultStyles, darkStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import type { ProcessDoc } from "@/lib/wiki";

interface WholeDocJsonViewProps {
  doc: ProcessDoc;
  dark?: boolean;
  expanded?: boolean;
}

export default function WholeDocJsonView({ doc, dark = false, expanded = false }: WholeDocJsonViewProps) {
  // Render the actual loaded process JSON data directly
  const docData = React.useMemo(() => {
    return doc.rawJson ?? doc;
  }, [doc]);

  // Collapse keys inside "meta" or "provenance" by default in Source mode
  const shouldExpandNode = React.useCallback(
    (level: number, value: any, field?: string) => {
      if (expanded) {
        return true;
      }
      if (field === "meta" || field === "provenance") {
        return false;
      }
      return true; // expand content elements
    },
    [expanded]
  );

  return (
    <div className="whole-doc-json-view">
      <div className="json-view-container">
        <JsonView
          data={docData}
          shouldExpandNode={shouldExpandNode}
          style={dark ? darkStyles : defaultStyles}
        />
      </div>
    </div>
  );
}
