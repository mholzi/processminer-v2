"use client";

// Single dispatch point for the per-section summary headers (risk matrix,
// worst-first bars, country × step grid, etc.). ProcessDocScreen used to
// hold a long `section === "pain-points" && …` chain; this registry keeps
// the section→summary mapping in one place so adding a new summary means
// adding one entry, not editing two call-sites.

import type { WikiPage } from "@/lib/wiki";
import type { GetRef } from "@/lib/linkify";
import AuditFindingsSummary from "./AuditFindingsSummary";
import ClientJourneyStrip from "./ClientJourneyStrip";
import ControlGapsSummary from "./ControlGapsSummary";
import ControlsSummary from "./ControlsSummary";
import CountryVariationsSummary from "./CountryVariationsSummary";
import ExceptionsSummary from "./ExceptionsSummary";
import InnovationIdeasSummary from "./InnovationIdeasSummary";
import MetricsSummary from "./MetricsSummary";
import PainPointsSummary from "./PainPointsSummary";
import RegulationSummary from "./RegulationSummary";

type Common = {
  elements: WikiPage[];
  allElements: WikiPage[];
  onPickElement?: (id: string) => void;
  getRef?: GetRef;
};

export default function SectionSummary({
  section,
  elements,
  allElements,
  onPickElement,
  getRef,
}: Common & { section: string }) {
  if (elements.length === 0) return null;

  switch (section) {
    case "pain-points":
      return (
        <PainPointsSummary
          painPoints={elements}
          onPickElement={onPickElement}
          getRef={getRef}
        />
      );
    case "country-variations":
      return (
        <CountryVariationsSummary
          variations={elements}
          onPickElement={onPickElement}
          getRef={getRef}
        />
      );
    case "controls":
      return (
        <ControlsSummary
          controls={elements}
          onPickElement={onPickElement}
          getRef={getRef}
        />
      );
    case "regulation":
      return (
        <RegulationSummary
          regulations={elements}
          allElements={allElements}
          onPickElement={onPickElement}
          getRef={getRef}
        />
      );
    case "control-gaps":
      return (
        <ControlGapsSummary
          gaps={elements}
          onPickElement={onPickElement}
          getRef={getRef}
        />
      );
    case "audit-findings":
      return (
        <AuditFindingsSummary
          findings={elements}
          onPickElement={onPickElement}
          getRef={getRef}
        />
      );
    case "innovation-ideas":
      return (
        <InnovationIdeasSummary
          ideas={elements}
          onPickElement={onPickElement}
          getRef={getRef}
        />
      );
    case "touchpoints":
      return (
        <ClientJourneyStrip
          steps={allElements.filter((e) => e.type === "process-step")}
          touchpoints={elements}
          moments={allElements.filter((e) => e.type === "moment")}
          frictionPoints={allElements.filter(
            (e) => e.type === "friction-point",
          )}
          onPickElement={onPickElement}
          getRef={getRef}
        />
      );
    case "metrics":
      return (
        <MetricsSummary
          metrics={elements}
          onPickElement={onPickElement}
          getRef={getRef}
        />
      );
    case "exceptions":
      return (
        <ExceptionsSummary
          exceptions={elements}
          onPickElement={onPickElement}
          getRef={getRef}
        />
      );
    default:
      return null;
  }
}
