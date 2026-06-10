"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Modal from "./Modal";
import { useFocusTrap } from "./useFocusTrap";

interface SkillData {
  id: string;
  name: string;
  description: string;
  body: string;
  raw?: string;
}

const SPECIALIST_ELEMENT_MAP: Record<string, string[]> = {
  "process-specialist": ["process-step", "exception", "pain-point", "process-gap", "role", "metric"],
  "control-compliance-specialist": ["control", "regulation", "compliance-gap", "audit-finding"],
  "client-journey-specialist": ["cx-channel", "cx-touchpoint", "moment", "friction-point", "competitor-cx", "cx-benchmark"],
  "innovation-analyst": ["market-trend", "competitor-innovation", "innovation-idea", "innovation-risk"],
  "solution-architect": ["system", "integration"],
  "transformation-agent": ["target-state", "transformation-decision", "gap"],
};

export default function SkillsEditorPanel() {
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [coreSystemPrompt, setCoreSystemPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<SkillData | null>(null);
  const [activeTab, setActiveTab] = useState<"roster" | "core-prompt">("roster");

  const [editingSkill, setEditingSkill] = useState<SkillData | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const drawerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(drawerRef, () => setSelectedSkill(null), !!selectedSkill);

  async function fetchSkills() {
    try {
      const res = await fetch("/api/skills");
      if (!res.ok) throw new Error("Failed to load skills definition");
      const data = await res.json();
      setSkills(data.skills || []);
      setCoreSystemPrompt(data.coreSystemPrompt || "");
    } catch (err: any) {
      setError(err.message || "Failed to load skills.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSkills();
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
        s.id.toLowerCase().includes(lowerQuery) ||
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
          "solution-architect",
          "domain-architect",
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

  const handleEditClick = (skill: SkillData) => {
    setEditingSkill(skill);
    setEditorContent(skill.raw || skill.body);
    setSaveSuccess(null);
    setError(null);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill || saving) return;
    setSaving(true);
    setError(null);
    setSaveSuccess(null);

    try {
      const res = await fetch("/api/admin/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingSkill.id,
          content: editorContent,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Save failed.");
      }

      setSaveSuccess(`Successfully saved skill. Backup created: ${data.backup}`);
      
      // Refresh local skill content
      // Parse the edited frontmatter + body to update local state
      const match = editorContent.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
      let name = editingSkill.name;
      let description = editingSkill.description;
      let body = editorContent;
      const raw = editorContent;
      
      if (match) {
        const fm = match[1];
        body = match[2].trim();
        const nameMatch = fm.match(/^name:\s*(.+)$/m);
        if (nameMatch) name = nameMatch[1].replace(/['"]/g, "").trim();
        const descMatch = fm.match(/description:\s*(?:>-\s*\n)?([\s\S]*?)(?:^[a-z0-9_-]+:|$)/im);
        if (descMatch) {
          description = descMatch[1]
            .split("\n")
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .join(" ");
        }
      }

      setSkills((prev) =>
        prev.map((s) =>
          s.id === editingSkill.id
            ? { ...s, name, description, body, raw }
            : s
        )
      );

      // Also update selectedSkill if it's currently open
      if (selectedSkill && selectedSkill.id === editingSkill.id) {
        setSelectedSkill({ id: editingSkill.id, name, description, body, raw });
      }

      setTimeout(() => {
        setEditingSkill(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to save skill.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="skills-loading">
        <div className="loading-spinner" />
        <p>Loading AI Agent Skills…</p>
      </div>
    );
  }

  if (error && !editingSkill) {
    return (
      <div className="skills-error">
        <h3>Error loading skills</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="skills-dashboard" style={{ flex: 1, padding: "1.5rem" }}>
      <header className="admin-page-head" style={{ marginBottom: "1.5rem" }}>
        <div>
          <h1>Agent Skills & Shared Framework</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            Configure and refine the prompt guidelines and procedures for each AI agent persona. 
            All modifications automatically create a timestamped backup before writing to disk.
          </p>
        </div>
        
        <div className="skills-tabs" style={{ marginTop: "1rem" }}>
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
      </header>

      {activeTab === "roster" ? (
        <div className="skills-content" style={{ padding: 0 }}>
          <div className="skills-filters" style={{ marginBottom: "1.5rem" }}>
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
                      
                      <div className="skill-card-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                        <span style={{ color: "var(--accent)", fontWeight: 500 }}>Read instructions →</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(skill);
                          }}
                          style={{
                            background: "var(--accent-soft)",
                            color: "var(--accent)",
                            border: "none",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            fontWeight: 500,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          ✏ Edit
                        </button>
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
                      
                      <div className="skill-card-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                        <span style={{ color: "var(--accent)", fontWeight: 500 }}>Read instructions →</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(skill);
                          }}
                          style={{
                            background: "var(--accent-soft)",
                            color: "var(--accent)",
                            border: "none",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            fontWeight: 500,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          ✏ Edit
                        </button>
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
                      
                      <div className="skill-card-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                        <span style={{ color: "var(--accent)", fontWeight: 500 }}>Read instructions →</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(skill);
                          }}
                          style={{
                            background: "var(--accent-soft)",
                            color: "var(--accent)",
                            border: "none",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            fontWeight: 500,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          ✏ Edit
                        </button>
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
        <div className="skills-content core-prompt-view" style={{ margin: 0, padding: "1.5rem" }}>
          <div className="core-prompt-header">
            <h3>Shared Engine Prompt Definition</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "4px" }}>
              This is the foundational prompt logic that shapes all AI interactions, tool invocations, and workspace boundaries.
            </p>
          </div>
          <div className="markdown-body core-prompt-body" style={{ marginTop: "1rem" }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {coreSystemPrompt || "*No core system prompt definition found.*"}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Slide-over details drawer for a single skill */}
      {selectedSkill && (
        <div className="skill-drawer-overlay" onClick={() => setSelectedSkill(null)}>
          <div
            ref={drawerRef}
            className="skill-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={`${formatTitle(selectedSkill.name)} skill details`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="skill-drawer-head">
              <div className="drawer-title-block">
                <h2>{formatTitle(selectedSkill.name)}</h2>
                <code className="skill-code-id">{selectedSkill.id}</code>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <button
                  type="button"
                  onClick={() => handleEditClick(selectedSkill)}
                  style={{
                    background: "var(--accent)",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: 500,
                  }}
                >
                  ✏ Edit
                </button>
                <button className="btn-close-drawer" onClick={() => setSelectedSkill(null)}>
                  ✕
                </button>
              </div>
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

      {/* Edit modal */}
      {editingSkill && (
        <Modal
          title={`Edit Skill Prompt: ${formatTitle(editingSkill.name)}`}
          className="admin-modal"
          onClose={() => !saving && setEditingSkill(null)}
          closeOnOverlay={!saving}
          width={900}
        >
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Editing <code>.claude/skills/{editingSkill.id}/SKILL.md</code>. Frontmatter block is included at the top.
            </div>
            <textarea
              autoFocus
              value={editorContent}
              onChange={(e) => setEditorContent(e.target.value)}
              disabled={saving}
              rows={20}
              style={{
                width: "100%",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: "0.9rem",
                padding: "0.75rem",
                background: "var(--bg-app)",
                border: "1px solid var(--border)",
                borderRadius: "0.25rem",
                color: "var(--text)",
                lineHeight: "1.4",
              }}
            />

            {error && <div className="modal-error">⚠ {error}</div>}
            {saveSuccess && <div style={{ color: "var(--success, #10b981)", fontSize: "0.9rem" }}>✓ {saveSuccess}</div>}

            <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem", marginTop: "1rem" }}>
              <button
                type="button"
                className="act"
                onClick={() => setEditingSkill(null)}
                disabled={saving}
                style={{
                  background: "transparent",
                  border: "1px solid var(--border)",
                  color: "var(--text-muted)",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.25rem",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="act ai"
                disabled={saving}
                style={{
                  background: "var(--accent)",
                  color: "#fff",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.25rem",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                {saving ? "Saving…" : "Save Prompt"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
