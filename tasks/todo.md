# Mobilitätspunkte Viz — Todo

## Status: feature/map-viz branch — ready to merge

## Done (this session)
- [x] Full map viz implementation (Tasks 1–16): parseData, mapProjection, mapLayout, CSS tokens, all components, useMapData, App.tsx rewrite, delete legacy radial viz
- [x] Replaced SVG blur filter on dots → glow-ring (semi-transparent circle, no feGaussianBlur)
- [x] Munich Stadtbezirke outlines as map background (25 districts from Overpass API, proj4 projection alignment)
- [x] District outline opacity tuned to 0.45

## Next (new session)
- [ ] Task 17: Final interaction verification (hover, select, filter chips, search, Esc, detail panel)
- [ ] Task 18: Deploy to Vercel (pnpm build confirmed clean)
- [ ] Merge feature/map-viz → main
- [ ] Consider: tooltip with district name on hover
- [ ] Consider: mobile layout / responsive breakpoints
