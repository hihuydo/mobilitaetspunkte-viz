# Mobilitätspunkte Viz — Lessons Learned

## GeoJSON in Vite

- Vite does NOT handle `.geojson` extension natively — Rollup treats it as JS → parse error
- Fix: use `import url from '../../data/file.geojson?url'` + runtime `fetch()`, same pattern as CSV
- Add `declare module '*.geojson?url' { const url: string; export default url }` to `vite-env.d.ts`
- `@types/geojson` needed as devDependency for `FeatureCollection` type

## D3 + proj4 Projection Pipeline

- For overlaying GeoJSON (WGS84) onto an EPSG:25832 linear-scale map:
  - Use `geoTransform({ point(lon, lat) { ... } })` from `d3` — NOT from `d3-geo` (separate package not installed)
  - Inside `point()`: proj4(WGS84, EPSG25832, [lon, lat]) → then apply existing linear scaleX/scaleY
  - This guarantees pixel-perfect alignment between GeoJSON paths and station dots
- `geoTransform` + `geoPath` is the correct d3 API for custom projections (not raw function)

## OSM / Overpass for City Districts

- Munich Stadtbezirke: admin_level=9 within admin_level=6 (München)
- Working Overpass query: `area["name"="München"]["admin_level"="6"]->.searchArea; relation["admin_level"="9"](area.searchArea); out geom;`
- OSM returns `[out:json]` with way geometries; needs manual ring-merging to build closed polygons
- Alternative clean source: GitHub Gist freinold/26eba0e6038bc1cff80cf250bde402ab (69 KB, all Polygons, WGS84)
- Simplifying coordinate precision to 4 decimal places (~11m) reduces file size: 228 KB → 158 KB

## SVG Glow without Filters

- `feGaussianBlur` on SVG circles blurs the entire dot including edges → looks soft/unclear
- Better: draw a second circle (same cx/cy/color) with larger radius and low opacity behind the dot
- No SVG `<filter>` needed → no filter region issues, no performance cost
- Transition `r` and `opacity` on the glow ring for smooth hover/select states

## Filter Architecture

- Unified filter in App.tsx: compute `activeIndices: Set<number>` from all filters combined
- MapDots receives `isFiltering` + `activeIndices` — stays dumb, only dims/brightens
- AND-Logik für Dienst-Filter: `[...activeServiceFields].every(f => s.services[f])`
- Gruppen-Filter + Suche + Dienst-Filter kombinierbar in einem `useMemo`
- Service-Chip-Farben als Hex-Map in ServiceFilter.tsx (CSS vars unzuverlässig in inline styles)

## Worktree

- Branch: `feature/map-viz` at `.worktrees/map-viz` (merged to main)
- Dev server: ports 5173–5177 oft belegt, aktuell 5178
