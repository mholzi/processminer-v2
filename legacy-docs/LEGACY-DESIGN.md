# Design System — Processminer

Erstellt von `/design-consultation` am 2026-05-16.

## Product Context
- **Was das ist:** Tool, in dem KI-Agenten im interaktiven Brainstorming das
  Wissen eines Subject-Matter-Experts (SME) zu einem Prozess extrahieren,
  dokumentieren und in einen Target State entwickeln.
- **Wer es nutzt:** Prozess-SMEs (nicht-technisch, zeitknapp); das
  Transformations-Team als Konsument.
- **Space/Industry:** Prozess- und Compliance-Dokumentation in regulierten
  Industrien (initialer Fokus Banking).
- **Projekttyp:** Web-App, App-UI (datenintensiv, Desktop-only).
- **Memorable Thing:** „Nimmt meine Arbeit ernst." Jede Designentscheidung
  dient diesem einen Eindruck.

## Aesthetic Direction
- **Direction:** Refined Utilitarian — funktionsorientiert und dicht wie ein
  Werkzeug, mit einer Präzision, die Sorgfalt signalisiert.
- **Decoration level:** minimal — Typografie und Weißraum tragen die Arbeit.
- **Mood:** Ruhig, präzise, ernst. Dichte ohne Lärm. Sieht aus wie ein
  professionelles Aufzeichnungssystem, nicht wie eine Startup-App.
- **Signatur:** Provenance-first — maschinell-entworfen vs. menschlich-bestätigt
  ist eine ruhige, erstklassige visuelle Unterscheidung (Track-Changes-
  Sensibilität für KI-extrahiertes Wissen), nie ein „✨ KI"-Effekt.

## Typography
- **Display/Hero & Body / UI / Labels:** **Geist** (Vercel, OFL-lizenziert) —
  humanistisch, ruhig, autoritativ. Eine Familie für die gesamte App.
- **Data/Tables/IDs/Quellen:** **Geist Mono** (`tabular-nums`).
- **Stack:** `"Geist", -apple-system, system-ui, sans-serif` ·
  `"Geist Mono", ui-monospace, "SF Mono", monospace`.
- **Scale (px):** 12 · 13 · 14 (Body-Default) · 16 · 19 · 24 · 30. Hierarchie
  primär über Gewicht (Regular 400 / Medium 500 / Semibold 600) und Größe —
  eine Familie, diszipliniert geführt.

## Color
- **Approach:** restrained — neutrale Palette + ein Marken-Akzent. Farbe ist
  selten und bedeutungstragend.
- **Primary / Akzent:** `#1e40af` — Deep Blue. Primäraktionen, aktive Zustände,
  Markenpunkte. Nicht fluten.
- **Secondary:** `#2563eb` — Bright Blue. Links, Info-Hinweise, sekundäre
  Betonung. Sparsam.
- **Akzent weich:** `#e9eaf6` — Hintergrund für Agenten-Entwurf-Felder,
  aktive Nav-Items.
- **Neutrals:** Hintergrund `#f7f8f8` · Fläche `#ffffff` · Tinte/Text `#16181d`
  · gedämpfter Text `#6b7280` · Linie/Border `#e2e4e8`.
- **Semantic (entsättigt, ruhig — nicht alarmierend):** Vertrauen hoch / success
  `#3f7d5c` · Vertrauen mittel / warning `#9a7b32` · Vertrauen niedrig / error
  `#a8534a` · info `#2563eb`.
- **Dark mode:** Flächen neu gedacht — Hintergrund `#101216`, Fläche `#181b21`,
  Linie `#2a2e37`, Text `#e8eaed`. Akzent aufgehellt auf `#8095e8` (Deep Blue
  ist auf Dunkel zu dunkel). Semantik-Farben ~15 % entsättigt.

## Spacing
- **Base unit:** 4px.
- **Density:** kompakt-komfortabel (datendichte App-UI, Tufte: Data-to-Ink hoch
  halten, aber nie gequetscht).
- **Scale:** 2xs(2) · xs(4) · sm(8) · md(12) · lg(16) · xl(24) · 2xl(32) · 3xl(48).

## Layout
- **Approach:** grid-disciplined — strenges Raster, vorhersehbare Ausrichtung.
- **App-Shell:** 3 Spalten — links Abschnitts-Navigation + Fortschritt · Mitte
  Dokument-Canvas · rechts einklappbare Agenten-Hinweise (siehe Plan F1).
- **Max content width:** Dokument-Canvas ~720px (lesbare Zeilenlänge trotz
  dichter App).
- **Viewport:** Desktop-only, Mindestbreite ~1280px (Plan F6). Kein Mobile.
- **Border radius:** sm 4px (Felder, Buttons, Inputs) · md 6px (Karten, Panels)
  · pill 9999px nur für Confidence-Chips. Bewusst klein — ruhig, nicht bubbly.

## Motion
- **Approach:** minimal-functional — nur Übergänge, die Verständnis stützen
  (Feld-Übernahme, Abschnitt-fertig, progressives Draft-Skeleton). Keine
  Dekoration. „Das Ende der visuellen Theatralik."
- **Easing:** enter `ease-out` · exit `ease-in` · move `ease-in-out`.
- **Duration:** micro 80–120ms · short 150–200ms · medium 250–300ms.

## Decisions Log
| Datum | Entscheidung | Begründung |
|-------|--------------|------------|
| 2026-05-16 | Designsystem erstellt | `/design-consultation`, Memorable Thing „nimmt meine Arbeit ernst" |
| 2026-05-16 | Akzent = Deep Blue `#1e40af` + Bright Blue `#2563eb` | Ein Marken-Akzent, ruhig, vertraut für Compliance-Kontexte; keine externen Brand-Lizenzen |
| 2026-05-16 | Schrift = Geist (Display, Body, Mono) | OFL-lizenziert, humanistisch, ruhig; eine Familie für die gesamte App |
| 2026-05-16 | Eine-Schriftfamilie-Disziplin, minimal Motion, Desktop-only | Ruhe, Dichte, Compliance-Tauglichkeit (Plan F6) |
| 2026-05-17 | Token-System in `globals.css`: `--text-*`, `--space-*`, `--r-pill`. Alle `font-size` auf die Typo-Skala, alle `padding`/`margin`/`gap` auf die 4px-Skala gerundet; 12px ist das Minimum (kein Sub-12-Tier). Geteilte `:focus-visible`-Regel. | `/design-review` — Skala wird durchgesetzt statt handgetippt; Konsistenz über alle Screens, Tastatur-Fokus überall sichtbar |
