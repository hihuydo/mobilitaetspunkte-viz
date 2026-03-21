# Mobilitätspunkte Viz — Todo

## Status: main — UX-polished, mobile-ready, pushed

## Done
- [x] Full radial viz (legacy, replaced by map)
- [x] Map viz: parseData, mapProjection, mapLayout, CSS tokens, all components
- [x] Munich Stadtbezirke outlines as map background
- [x] Merge feature/map-viz → main
- [x] Service-Filter (AND-Logik, Counter, Reset)
- [x] Unified filter pipeline (Anschluss + Suche + Mobilitätsangebote kombiniert)
- [x] Fix: @types/geojson + proj4 type declarations
- [x] 7 UX improvements: tooltip, subtitle, idle panel, merged filters, selection label, district hover, zoom/pan
- [x] Mobile-responsive layout (bottom-sheet, NavBar stacking, touch-friendly zoom buttons)
- [x] Fix: SVG path error in Isar river (malformed Q commands)
- [x] Zoom controls moved to top-right
- [x] Size legend moved to bottom-right corner
- [x] 9 further UX improvements:
  - Mobilitätsangebote dropdown (statt inline chips)
  - Anschluss chips mit Stationsanzahl-Badge
  - Empty state overlay bei 0 Treffern
  - Tooltip zeigt farbige Service-Dots
  - District hover zeigt Stationsanzahl (geoContains)
  - Idle panel "→ anzeigen"-Buttons für schnelle Filterung
  - Stärkerer visueller Ring für selektierte Dots
  - Live-Trefferanzahl neben Suchfeld
  - URL-Parameter ?station= für geteilte Links
- [x] Fix: Mobilitätsangebote-Dropdown nicht hinter Karte (z-20, overflow entfernt)
- [x] Textfarben aufgehellt (map-text-muted, map-text-dim) für bessere Lesbarkeit
- [x] Schriftgrößen erhöht (filter bar, nav, detail panel, legend)
- [x] Umbenennung: Gruppe → Anschluss, Dienste → Mobilitätsangebote
- [x] Detail panel: Alle Mobilitätsangebote vor Mobilitätsangebote im Vergleich
- [x] Rename: Sonstige → Kein ÖPNV (beschreibt fehlenden ÖPNV-Anschluss)
- [x] Dot-Größe reduziert: DOT_MIN_R 4→3, DOT_MAX_R 16→11

## Next
- [ ] Deploy to Vercel
- [ ] Consider: Bezirks-Aggregation (Choropleth nach Versorgungsgrad)
- [ ] Consider: Vergleichs-/Ranking-Ansicht (sortierbare Liste)
- [ ] Consider: Share-Button mit URL-Kopie
