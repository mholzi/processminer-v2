"use client";

import React, { useState, useEffect, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface SkillData {
  id: string;
  name: string;
  description: string;
  body: string;
}

interface SkillsDashboardProps {
  onBack: () => void;
}

// Maps element types to the specialists that own them
const SPECIALIST_ELEMENT_MAP: Record<string, string[]> = {
  "process-specialist": ["process-step", "exception", "pain-point", "process-gap", "role", "metric"],
  "control-compliance-specialist": ["control", "regulation", "compliance-gap", "audit-finding"],
  "client-journey-specialist": ["cx-channel", "cx-touchpoint", "moment", "friction-point", "competitor-cx", "cx-benchmark"],
  "innovation-analyst": ["market-trend", "competitor-innovation", "innovation-idea", "innovation-risk"],
  "it-architect": ["system", "integration"],
  "transformation-agent": ["target-state", "transformation-decision", "gap"],
};

export default function SkillsDashboard({ onBack }: SkillsDashboardProps) {
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [coreSystemPrompt, setCoreSystemPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<SkillData | null>(null);
  const [activeTab, setActiveTab] = useState<"roster" | "core-prompt">("roster");

  useEffect(() => {
    fetch("/api/skills")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load skills definition");
        return res.json();
      })
      .then((data) => {
        setSkills(data.skills || []);
        setCoreSystemPrompt(data.coreSystemPrompt || "");
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const formatTitle = (name: string) => {
    return name
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  const categorizedSkills = useMemo(() => {
    const specialists: SkillData[] = [];
    const interactive: SkillData[] = [];
    const automated: SkillData[] = [];

    const lowerQuery = searchQuery.toLowerCase().trim();
    const filtered = skills.filter(
      (s) =>
        s.name.toLowerCase().includes(lowerQuery) ||
        s.description.toLowerCase().includes(lowerQuery) ||
        s.body.toLowerCase().includes(lowerQuery)
    );

    for (const skill of filtered) {
      if (
        [
          "process-specialist",
          "control-compliance-specialist",
          "client-journey-specialist",
          "innovation-analyst",
          "it-architect",
          "transformation-agent",
        ].includes(skill.id)
      ) {
        specialists.push(skill);
      } else if (
        [
          "qer-session",
          "foundational-run",
          "comment-review",
          "conflict-resolution",
          "add-entry",
          "dogfood-run",
          "council-review",
        ].includes(skill.id)
      ) {
        interactive.push(skill);
      } else {
        automated.push(skill);
      }
    }

    return { specialists, interactive, automated };
  }, [skills, searchQuery]);

  if (loading) {
    return (
      <div className="skills-loading">
        <div className="loading-spinner" />
        <p>Loading AI Agent Skills…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="skills-error">
        <h3>Error loading skills</h3>
        <p>{error}</p>
        <button onClick={onBack} className="btn-back">
          Back to Overview
        </button>
      </div>
    );
  }

  return (
    <div className="skills-dashboard">
      <div className="canvas-head">
        <div className="skills-head-title">
          <button className="btn-icon-back" onClick={onBack} title="Back to document view">
            ←
          </button>
          <h1>Agent Skills & Shared Framework</h1>
        </div>
        
        <div className="skills-tabs">
          <button
            className={`skills-tab ${activeTab === "roster" ? "active" : ""}`}
            onClick={() => setActiveTab("roster")}
          >
            Skill Roster
          </button>
          <button
            className={`skills-tab ${activeTab === "core-prompt" ? "active" : ""}`}
            onClick={() => setActiveTab("core-prompt")}
          >
            Core System Prompt
          </button>
        </div>
      </div>

      {activeTab === "roster" ? (
        <div className="skills-content">
          <div className="skills-filters">
            <input
              type="text"
              placeholder="Search skills by name, description, owned elements, or instructions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="skills-search-input"
            />
            {searchQuery && (
              <button className="skills-search-clear" onClick={() => setSearchQuery("")}>
                ✕
              </button>
            )}
          </div>

          <div className="skills-sections">
            {/* Specialists Category */}
            {categorizedSkills.specialists.length > 0 && (
              <section className="skills-category-sec">
                <h2 className="skills-category-title">🔍 Perspective Specialists</h2>
                <p className="skills-category-desc">
                  Domain expert agents running interactive elicitation and mapping specific areas of the process.
                </p>
                <div className="skills-grid">
                  {categorizedSkills.specialists.map((skill) => (
                    <div
                      key={skill.id}
                      className="skill-card hover-lift"
                      onClick={() => setSelectedSkill(skill)}
                    >
                      <div className="skill-card-badge spec">Specialist</div>
                      <h3>{formatTitle(skill.name)}</h3>
                      <code className="skill-code-id">{skill.id}</code>
                      <p className="skill-card-desc">{skill.description}</p>
                      
                      {SPECIALIST_ELEMENT_MAP[skill.id] && (
                        <div className="skill-elements-tags">
                          <strong>Owns:</strong>
                          <div className="tags-container">
                            {SPECIALIST_ELEMENT_MAP[skill.id].map((tag) => (
                              <span key={tag} className="tag-element-type">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="skill-card-footer">
                        <span>Read instructions →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Interactive Flows Category */}
            {categorizedSkills.interactive.length > 0 && (
              <section className="skills-category-sec">
                <h2 className="skills-category-title">🤝 Guided & Interactive Workflows</h2>
                <p className="skills-category-desc">
                  SME-facing interactive frameworks that sequence steps, resolve conflicts, and direct review.
                </p>
                <div className="skills-grid">
                  {categorizedSkills.interactive.map((skill) => (
                    <div
                      key={skill.id}
                      className="skill-card hover-lift"
                      onClick={() => setSelectedSkill(skill)}
                    >
                      <div className="skill-card-badge interactive">Interactive</div>
                      <h3>{formatTitle(skill.name)}</h3>
                      <code className="skill-code-id">{skill.id}</code>
                      <p className="skill-card-desc">{skill.description}</p>
                      <div className="skill-card-footer">
                        <span>Read instructions →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Automated / Background Category */}
            {categorizedSkills.automated.length > 0 && (
              <section className="skills-category-sec">
                <h2 className="skills-category-title">⚙ Automated Background Routines</h2>
                <p className="skills-category-desc">
                  Non-interactive background jobs, batch extraction parsers, quality linters, and web research agents.
                </p>
                <div className="skills-grid">
                  {categorizedSkills.automated.map((skill) => (
                    <div
                      key={skill.id}
                      className="skill-card hover-lift"
                      onClick={() => setSelectedSkill(skill)}
                    >
                      <div className="skill-card-badge automated">Automated</div>
                      <h3>{formatTitle(skill.name)}</h3>
                      <code className="skill-code-id">{skill.id}</code>
                      <p className="skill-card-desc">{skill.description}</p>
                      <div className="skill-card-footer">
                        <span>Read instructions →</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {categorizedSkills.specialists.length === 0 &&
              categorizedSkills.interactive.length === 0 &&
              categorizedSkills.automated.length === 0 && (
                <div className="skills-empty-state">
                  <p>No skills matching "{searchQuery}" were found.</p>
                  <button onClick={() => setSearchQuery("")} className="btn-clear-filter">
                    Reset Filter
                  </button>
                </div>
              )}
          </div>
        </div>
      ) : (
        <div className="skills-content core-prompt-view">
          <div className="core-prompt-header">
            <h3>Shared Engine Prompt Definition</h3>
            <p>
              This is the foundational prompt logic that shapes all AI interactions, tool invocations, and workspace boundaries.
            </p>
          </div>
          <div className="markdown-body core-prompt-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {coreSystemPrompt || "*No core system prompt definition found.*"}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Slide-over details drawer for a single skill */}
      {selectedSkill && (
        <div className="skill-drawer-overlay" onClick={() => setSelectedSkill(null)}>
          <div className="skill-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="skill-drawer-head">
              <div className="drawer-title-block">
                <h2>{formatTitle(selectedSkill.name)}</h2>
                <code className="skill-code-id">{selectedSkill.id}</code>
              </div>
              <button className="btn-close-drawer" onClick={() => setSelectedSkill(null)}>
                ✕
              </button>
            </div>
            <div className="skill-drawer-desc-banner">
              <p>{selectedSkill.description}</p>
            </div>
            <div className="skill-drawer-body markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {selectedSkill.body}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
