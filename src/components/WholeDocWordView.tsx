"use client";

import React from "react";
import type { Schema, ProcessDoc, WikiPage } from "@/lib/wiki";
import type { LinkGroup } from "@/lib/relations";
import type { LintFinding } from "@/lib/lint";
import ElementCard from "./ElementCard";

interface WholeDocWordViewProps {
  doc: ProcessDoc;
  schema: Schema;
  user: { name: string };
  elementLinks: (el: WikiPage) => LinkGroup[];
  getRef: (id: string) => { page: WikiPage; typeLabel: string } | undefined;
  resolveOwner: (name: string) => string | undefined;
  findingsByElement: Record<string, LintFinding[]>;
  currentRunId?: string;
  goToElement: (id: string) => void;
  deepDive: (args: {
    id: string;
    title: string;
    kind: "element" | "finding";
    elements?: string[];
    detail?: string;
  }) => void;
  reviewComments: (id: string, title: string) => void;
  setSelectedThemeId: (id: string) => void;
  setSection: (sectionId: string) => void;
  expandMeta: boolean;
  onSaved?: () => void;
}

export default function WholeDocWordView({
  doc,
  schema,
  user,
  elementLinks,
  getRef,
  resolveOwner,
  findingsByElement,
  currentRunId,
  goToElement,
  deepDive,
  reviewComments,
  setSelectedThemeId,
  setSection,
  expandMeta,
  onSaved,
}: WholeDocWordViewProps) {
  // Group elements by section to make lookups fast
  const elementsBySection = React.useMemo(() => {
    const map: Record<string, WikiPage[]> = {};
    for (const el of doc.elements) {
      (map[el.section] ??= []).push(el);
    }
    // Sort elements in each section by ID
    for (const secId of Object.keys(map)) {
      map[secId].sort((a, b) => a.id.localeCompare(b.id));
    }
    return map;
  }, [doc.elements]);

  return (
    <div className="whole-doc-word-view">
      {doc.process.body && (
        <header className="word-doc-header">
          <p className="word-doc-subtitle">{doc.process.body}</p>
        </header>
      )}

      {/* Table of Contents Section */}
      <section className="word-doc-toc">
        <h2 className="toc-title">Table of Contents</h2>
        <ul className="toc-list">
          {schema.areas.map((area) => {
            const hasElementsInArea = area.sections.some(
              (sec) => (elementsBySection[sec.id]?.length ?? 0) > 0
            );
            if (!hasElementsInArea) return null;

            return (
              <li key={area.id} className="toc-area-item">
                <a href={`#area-${area.id}`} className="toc-link area-link">
                  {area.label}
                </a>
                <ul className="toc-sublist">
                  {area.sections.map((section) => {
                    const sectionElements = elementsBySection[section.id] ?? [];
                    if (sectionElements.length === 0) return null;
                    return (
                      <li key={section.id} className="toc-section-item">
                        <a href={`#section-${section.id}`} className="toc-link section-link">
                          {section.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="word-doc-content">
        {schema.areas.map((area) => {
          // Check if area has any sections with elements
          const hasElementsInArea = area.sections.some(
            (sec) => (elementsBySection[sec.id]?.length ?? 0) > 0
          );
          if (!hasElementsInArea) return null;

          return (
            <div key={area.id} className="word-doc-area">
              <h2 id={`area-${area.id}`} className="word-doc-area-title">
                {area.label}
              </h2>
              
              {area.sections.map((section) => {
                const sectionElements = elementsBySection[section.id] ?? [];
                if (sectionElements.length === 0) return null;

                // Group elements by type within this section, in schema type order
                const typeGroups = Object.keys(schema.elementTypes)
                  .map((t) => ({
                    type: t,
                    label: schema.elementTypes[t].label,
                    elements: sectionElements.filter((e) => e.type === t),
                  }))
                  .filter((g) => g.elements.length > 0);

                const multiType = typeGroups.length > 1;

                return (
                  <div key={section.id} className="word-doc-section">
                    <h3 id={`section-${section.id}`} className="word-doc-section-title">
                      {section.label}
                      {section.description && (
                        <span className="word-doc-section-desc">
                          {section.description}
                        </span>
                      )}
                    </h3>

                    <div className="word-doc-elements">
                      {multiType
                        ? typeGroups.map((g) => (
                            <div key={g.type} className="word-doc-type-group">
                              <h4 className="word-doc-type-group-title">
                                {g.label}
                              </h4>
                              {g.elements.map((el) => (
                                <ElementCard
                                  key={el.id}
                                  page={el}
                                  slug={doc.slug}
                                  userName={user.name}
                                  typeLabel={
                                    schema.elementTypes[el.type]?.label ?? el.type
                                  }
                                  template={schema.elementTypes[el.type]?.template}
                                  fieldSpecs={
                                    schema.elementTypes[el.type]?.frontmatter?.fields ?? []
                                  }
                                  requiredFields={
                                    schema.elementTypes[el.type]?.frontmatter?.required ?? []
                                  }
                                  relationSpecs={
                                    schema.elementTypes[el.type]?.frontmatter?.relations ?? []
                                  }
                                  links={elementLinks(el)}
                                  getRef={getRef}
                                  resolveOwner={resolveOwner}
                                  notes={doc.notes?.[el.id]}
                                  onGoToElement={goToElement}
                                  onDeepDive={(id, title) =>
                                    deepDive({ id, title, kind: "element" })
                                  }
                                  onReviewComments={reviewComments}
                                  onShowOnFlow={(themeId) => {
                                    setSelectedThemeId(themeId);
                                    setSection("process-steps");
                                  }}
                                  findings={findingsByElement[el.id]}
                                  onFindingDeepDive={(f) =>
                                    deepDive({
                                      id: f.id,
                                      title: f.title,
                                      kind: "finding",
                                      elements: f.elements,
                                      detail: f.detail,
                                    })
                                  }
                                  defaultCollapsed={false}
                                  isCurrent={el.id === currentRunId}
                                  allElements={doc.elements}
                                  showMeta={expandMeta}
                                  asDocument={true}
                                  onSaved={onSaved}
                                />
                              ))}
                            </div>
                          ))
                        : sectionElements.map((el) => (
                            <ElementCard
                              key={el.id}
                              page={el}
                              slug={doc.slug}
                              userName={user.name}
                              typeLabel={
                                schema.elementTypes[el.type]?.label ?? el.type
                              }
                              template={schema.elementTypes[el.type]?.template}
                              fieldSpecs={
                                schema.elementTypes[el.type]?.frontmatter?.fields ?? []
                              }
                              requiredFields={
                                schema.elementTypes[el.type]?.frontmatter?.required ?? []
                              }
                              relationSpecs={
                                schema.elementTypes[el.type]?.frontmatter?.relations ?? []
                              }
                              links={elementLinks(el)}
                              getRef={getRef}
                              resolveOwner={resolveOwner}
                              notes={doc.notes?.[el.id]}
                              onGoToElement={goToElement}
                              onDeepDive={(id, title) =>
                                deepDive({ id, title, kind: "element" })
                              }
                              onReviewComments={reviewComments}
                              onShowOnFlow={(themeId) => {
                                setSelectedThemeId(themeId);
                                setSection("process-steps");
                              }}
                              findings={findingsByElement[el.id]}
                              onFindingDeepDive={(f) =>
                                deepDive({
                                  id: f.id,
                                  title: f.title,
                                  kind: "finding",
                                  elements: f.elements,
                                  detail: f.detail,
                                })
                              }
                              defaultCollapsed={false}
                              isCurrent={el.id === currentRunId}
                              allElements={doc.elements}
                              showMeta={expandMeta}
                              asDocument={true}
                              onSaved={onSaved}
                            />
                          ))}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
