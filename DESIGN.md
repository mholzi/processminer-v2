# Design System — Processminer v2

Erstellt von `/design-consultation` am 2026-05-16.

## Product Context
- **Was das ist:** Internes Tool der Deutschen Bank — KI-Agenten extrahieren im
  interaktiven Brainstorming das Wissen eines Subject-Matter-Experts (SME) zu
  einem Bankprozess, dokumentieren es und entwickeln es in einen Target State.
- **Wer es nutzt:** Banking-SMEs (nicht-technisch, zeitknapp); das
  Transformations-Team als Konsument.
- **Space/Industry:** Bank, Prozess-/Compliance-Dokumentation. Internes Tool.
- **Projekttyp:** Web-App, App-UI (datenintensiv, Desktop-only).
- **Memorable Thing:** „Nimmt meine Arbeit ernst.“ Jede Designentscheidung
  dient diesem einen Eindruck.

## Aesthetic Direction
- **Direction:** Refined Utilitarian — funktionsorientiert und dicht wie ein
  Werkzeug, mit einer Präzision, die Sorgfalt signalisiert.
- **Decoration level:** minimal — Typografie und Weißraum tragen die Arbeit.
- **Mood:** Ruhig, präzise, ernst. Dichte ohne Lärm. Sieht aus wie das
  Aufzeichnungssystem einer Bank, nicht wie eine Startup-App.
- **Signatur:** Provenance-first — maschinell-entworfen vs. menschlich-bestätigt
  ist eine ruhige, erstklassige visuelle Unterscheidung (Track-Changes-
  Sensibilität für KI-extrahiertes Wissen), nie ein „✨ KI“-Effekt.

## Typography
- **Display/Hero:** Deutsche Bank Display — Hausschrift, humanistisch. Lizenziert
  über das DB Brand Portal.
- **Body / UI / Labels:** Deutsche Bank Text (DB Text) — Hausschrift,
  autoritativer Ton, ohne runde Striche. Lizenziert.
- **Data/Tables/IDs/Quellen:** Geist Mono (`tabular-nums`) — bewusste Abweichung:
  Deutsche Bank hat keine Haus-Monospace.
- **Entwickler-Fallback:** `"Deutsche Bank Text", "Geist", -apple-system, system-ui,
  sans-serif`. Geist nur als Fallback, bis die Hauslizenz-Schriften eingebunden
  sind. KEINE Default-Stacks als Primärschrift.
- **Scale (px):** 12 · 13 · 14 (Body-Default) · 16 · 19 · 24 · 30. Hierarchie
  primär über Gewicht (Regular 400 / Medium 500 / Semibold 600) und Größe —
  eine Familie, diszipliniert geführt.

## Color
- **Approach:** restrained — neutrale Palette + ein Marken-Akzent. Farbe ist
  selten und bedeutungstragend.
- **Primary / Akzent:** `#0018A8` — Deutsche Bank Blue (Pantone 286 C).
  Primäraktionen, aktive Zustände, Markenpunkte. Nicht fluten.
- **Secondary:** `#00A3E0` — DB Bright Blue. Links, Info-Hinweise, sekundäre
  Betonung. Sparsam.
- **Akzent weich:** `#e9eaf6` — Hintergrund für Agenten-Entwurf-Felder,
  aktive Nav-Items.
- **Neutrals:** Hintergrund `#f7f8f8` · Fläche `#ffffff` · Tinte/Text `#16181d`
  · gedämpfter Text `#6b7280` · Linie/Border `#e2e4e8`.
- **Semantic (entsättigt, ruhig — nicht alarmierend):** Vertrauen hoch / success
  `#3f7d5c` · Vertrauen mittel / warning `#9a7b32` · Vertrauen niedrig / error
  `#a8534a` · info `#00A3E0`.
- **Dark mode:** Flächen neu gedacht — Hintergrund `#101216`, Fläche `#181b21`,
  Linie `#2a2e37`, Text `#e8eaed`. Akzent aufgehellt auf `#8095e8` (DB-Blau ist
  auf Dunkel zu dunkel). Semantik-Farben ~15 % entsättigt.

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
  Dekoration. „Das Ende der visuellen Theatralik.“
- **Easing:** enter `ease-out` · exit `ease-in` · move `ease-in-out`.
- **Duration:** micro 80–120ms · short 150–200ms · medium 250–300ms.

## Decisions Log
| Datum | Entscheidung | Begründung |
|-------|--------------|------------|
| 2026-05-16 | Designsystem erstellt | `/design-consultation`, Memorable Thing „nimmt meine Arbeit ernst“ |
| 2026-05-16 | Akzent = Deutsche Bank Blue #0018A8 + Bright Blue #00A3E0 | Internes DB-Tool — markenkonform; v2 ist sichtbar Teil der Bank |
| 2026-05-16 | Schrift = Deutsche Bank Text/Display, Geist nur Fallback | Hausschriften lizenziert; stützen „ernsthaft“ stärker als neutrale Schrift |
| 2026-05-16 | Eine-Schriftfamilie-Disziplin, minimal Motion, Desktop-only | Ruhe, Dichte, Compliance-Tauglichkeit (Plan F6) |
