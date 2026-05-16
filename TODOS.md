# TODOS — Processminer v2

Erzeugt aus `/plan-ceo-review` am 2026-05-16. Quelle: CEO-Plan unter
`~/.gstack/projects/Processminer2/ceo-plans/2026-05-16-processminer-v2.md`.

## P1 — vor dem Bau / blockierend

### Kostenmodell + on-prem-Modell-Qualitätstest (vor Architektur-Lock)
- **Was:** Größenordnung der Modell-Kosten pro QER-Session schätzen; on-prem-/
  Gateway-Modell auf QER-Brainstorming-Tauglichkeit testen.
- **Warum:** Kosten können die Architektur ändern (Caching, kleineres Modell für
  Teilschritte). Ein zu schwaches on-prem-Modell ist Produkt-Tod, kein
  Endpoint-Wechsel — das muss VOR allem anderen feststehen.
- **Priorität:** P1 · **Effort:** human ~S / CC ~S · **Blockiert:** Architektur-Lock.

### Echtes Halluzinations-Gegenmittel entwerfen
- **Was:** Mechanismus gegen plausibel-aber-falsche Extraktion — Challenge-
  Schritte, Cross-Check gegen Raw Source, Negativ-Rückfragen.
- **Warum:** E4 (Confidence-Flags) ist nur Hygiene; selbst-eingeschätzte
  LLM-Confidence ist mit Korrektheit unkorreliert. In einem Compliance-Kontext
  die gefährlichste offene Lücke.
- **Priorität:** P1 · **Effort:** human ~M / CC ~S-M.

### QER-Abbruchkriterium ("fertig"-Definition)
- **Was:** Definieren, wann ein Prozess "ausreichend dokumentiert" ist.
- **Warum:** Brainstorming ist unbegrenzt; ohne Abbruchkriterium läuft die
  Session, bis der SME entnervt aufgibt — exakt die Reluctant-SME-Fehlerart.
- **Priorität:** P1 · **Effort:** human ~S / CC ~S.

### v1-Template-UI-Tauglichkeit prüfen
- **Was:** Prüfen, ob die ~25 v1-Schemas (für Entwickler-CLI entworfen) von
  einem nicht-technischen SME über eine UI füllbar sind.
- **Warum:** Sind sie zu granular/jargonlastig, blockiert die Schema-Validierung
  Sessions oder wird aufgeweicht — dann ist der Vollständigkeits-Garant weg.
- **Priorität:** P1 · **Effort:** human ~M / CC ~S.

### Security-Härtung vor Multi-SME-Betrieb
- **Was:** F3.1 Prompt-Injection-Schutz, F3.2 PII-Handling, F3.3 Autorisierung
  neu bewerten und entwerfen.
- **Warum:** In v2-v1 als Pilot-Annahme verworfen. Sobald v2 über den Piloten
  hinausgeht, sind alle drei zwingend.
- **Priorität:** P1 · **Effort:** human ~L / CC ~M · **Blockiert:** Multi-SME-Rollout.

### v1-Prozess von Hand ins Element-Modell zerlegen (Pre-Build-Check)
- **Was:** Einen vollständigen v1-Prozess manuell in das geplante
  Element-Modell zerlegen (Prozess ▸ Abschnitt ▸ Element).
- **Warum:** Niemand hat geprüft, ob die v1-Inhalte verlustfrei in atomare,
  einzeln adressierbare Elemente zerfallen. Querschnitts-Inhalte (eine Kontrolle
  für 3 Schritte, eingebettete Tabellen, CX-Diagramme) brechen das
  „ein Element, eine ID"-Modell und erzwingen ein n:m-Beziehungsmodell.
- **Warum jetzt:** Das Datenmodell (Wiki = Wahrheit, Elemente = Sicht) steht
  und fällt damit. Vor dem Architektur-Lock.
- **Priorität:** P1 · **Effort:** human ~S / CC — (Handübung, kein Code)
  · Quelle: Eng-Review Outside Voice #8.

## P2 — gleiche Branch / Phase 2

### E5 — autoresearch-Loop für QER-Prompt-Auto-Tuning
- **Was:** Autonome Experiment-Schleife (nach Karpathys autoresearch), die
  QER-Prompts gegen die Eval-Suite selbst tunt (Auto-Keep/Auto-Revert).
- **Warum:** QER-Qualität hängt massiv an Prompts + Technik-Auswahl — riesiger
  Suchraum, ideal für einen Loop. Die Eval-Suite (F6.1) wird jetzt schon
  autoresearch-kompatibel gebaut, damit kein Rework.
- **Priorität:** P2 · **Effort:** human ~M / CC ~S-M · **Depends:** Eval-Suite (F6.1).

### Menschlicher Wiki-Abfrage-Pfad (Phase 2)
- **Was:** Eine Möglichkeit, dass ein Mensch (SME / Transformations-Team) das
  Wiki abfragt — z.B. ein Such-/Frage-Feld, kein eigener Browser-Screen.
- **Warum:** v2-v1 hat keinen menschlichen Abfrage-Pfad — damit ist Premise 1
  (Wiederverwendung durch Menschen) und das Tier-2-Erfolgskriterium in v2-v1
  strukturell untestbar. Der Pfad ist nötig, um die Kern-Wette zu beweisen.
- **Priorität:** P2 (Phase 2) · **Effort:** human ~M / CC ~S
  · Quelle: Eng-Review Cross-Model-Spannung B.

### F2.3 — Wiki-Schreibkonflikt-Behandlung
- **Was:** Concurrency-Modell für parallele SME-Sessions ins selbe Wiki.
- **Warum:** In v2-v1 verworfen (Wedge = 1 SME). Vor Multi-SME zwingend.
- **Priorität:** P2 · **Effort:** human ~M / CC ~S · **Depends:** Wiki-Versioning (F1.1).

### F1.2 — Modulschnitt der Orchestrierungs-Schicht
- **Was:** State-Machine / Agenten-Ausführung / Wiki-Store als getrennte Module
  mit definierten Schnittstellen.
- **Warum:** Verhindert einen Orchestrierungs-Monolithen; macht Änderungen und
  Tests beherrschbar. → in `/plan-eng-review` entscheiden.
- **Priorität:** P2 · **Effort:** human ~S / CC ~S.

### Delight — Session-Memory
- **Was:** "Letztes Mal hast du bei Schritt 5 einen Pain Point erwähnt …"
- **Priorität:** P2 · **Effort:** human ~S / CC ~S.

### Delight — Auto-Prozessdiagramm
- **Was:** As-Is-Doku rendert automatisch als Flowchart.
- **Warum:** BMAD hat dafür bereits Excalidraw-Helfer — Hebel vorhanden.
- **Priorität:** P2 · **Effort:** human ~S-M / CC ~S.

### Delight — Management-Summary-Einseiter
- **Was:** Auto-generierter Einseiter für den Sponsor nach jeder Session.
- **Warum:** Hält das Mandat warm. v1 hat bereits management-summary-Templates.
- **Priorität:** P2 · **Effort:** human ~S / CC ~S.

### Wiki-Assistant — Streaming-Antworten
- **Was:** Den Wiki-Assistant von einer blockierenden Server-Action auf einen
  Streaming-Route-Handler umstellen — die Antwort erscheint Wort für Wort.
- **Warum:** In Slice 2a (Entscheidung D2 aus /plan-eng-review) bewusst
  zurückgestellt, um den Slice minimal zu halten; die blockierende Variante
  geht zuerst live. Streaming ist die erwartete Chat-UX und das Muster, das die
  orchestrierten Skills später ohnehin brauchen.
- **Priorität:** P2 · **Effort:** human ~S / CC ~S · Quelle: /plan-eng-review
  2026-05-16 (Slice-2a-Plan).

## P3 — Folge-Phase

### E3 — Living Docs (Drift-Detection)
- **Was:** Laufender Abgleich der Prozess-Docs gegen Realität (SOPs, Tickets,
  System-Logs); Flagging bei veralteter Doku.
- **Warum:** Macht aus dem Einmal-Tool eine Always-on-Schicht — die größte
  Vision.
- **Priorität:** P3 · **Effort:** human ~XL / CC ~L · **Depends:** Bank-System-
  Integrationen + deren IT-Freigaben.

## Design (aus /plan-design-review)

### Inline-Edit-Mechanik festlegen ("Selbst bearbeiten")
- **Was:** Wie "Selbst bearbeiten" an einem Wissens-Element funktioniert —
  inline vs. Modal vs. Seitenpanel.
- **Warum:** Detail-Interaktion, in der Design-Review als offen markiert.
- **Priorität:** P2 · **Effort:** human ~S / CC ~S.

## Verworfen

- **Delight Prozess-Diff-Ansicht** — nicht gewählt.
- **Delight Wiki-Query-Bot (Teams/Slack)** — nicht weiterverfolgt.
