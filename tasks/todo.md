# Mobilitätspunkte Viz — Todo

## Status: main — Karten-Viz mit Service-Filtern

## Done
- [x] Full radial viz (legacy, replaced by map)
- [x] Map viz: parseData, mapProjection, mapLayout, CSS tokens, all components
- [x] Munich Stadtbezirke outlines as map background
- [x] Merge feature/map-viz → main
- [x] Service-Filter (11 Dienst-Chips mit AND-Logik, Counter, Reset)
- [x] Unified filter pipeline (Gruppe + Suche + Dienste kombiniert)
- [x] Fix: @types/geojson + proj4 type declarations for clean build

## Next
- [ ] Deploy to Vercel (pnpm build confirmed clean)
- [ ] Consider: tooltip with station name on hover
- [ ] Consider: mobile layout / responsive breakpoints
- [ ] Consider: Bezirks-Aggregation (Choropleth nach Versorgungsgrad)
- [ ] Consider: Vergleichs-/Ranking-Ansicht (sortierbare Liste)
