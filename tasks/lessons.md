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

## District Station Count via geoContains

- To count stations per district: store `lonlat: [number, number]` on MapStation (computed once at layout time via proj4 UTM→WGS84)
- In MapBackground, use `d3.geoContains(feature, station.lonlat)` per station per district
- Memoize the count map (`useMemo` keyed on `districtPaths + stations`) — recomputing on every render would be expensive
- `geoContains` works on raw GeoJSON Feature objects (before projection), not on screen coords

## OSM / Overpass for City Districts

- Munich Stadtbezirke: admin_level=9 within admin_level=6 (München)
- Working Overpass query: `area["name"="München"]["admin_level"="6"]->.searchArea; relation["admin_level"="9"](area.searchArea); out geom;`
- Clean source: GitHub Gist freinold/26eba0e6038bc1cff80cf250bde402ab (69 KB, all Polygons, WGS84)
- Simplifying coordinate precision to 4 decimal places (~11m) reduces file size: 228 KB → 158 KB

## SVG Path Syntax (Q command)

- SVG `Q` (quadratic Bézier) requires exactly 4 numbers: `Q cx cy x y` (control point + end point)
- Chaining multiple curves: each segment needs its own full `Q cx cy x y` — they do NOT auto-chain like `T`
- Symptom of malformed path: `<path> attribute d: Expected number` browser console errors, path renders partially or not at all
- Fix: split into array of complete segments and `.join(' ')`

## SVG Glow without Filters

- `feGaussianBlur` on SVG circles blurs the entire dot including edges → looks soft/unclear
- Better: draw a second circle (same cx/cy/color) with larger radius and low opacity behind the dot
- No SVG `<filter>` needed → no filter region issues, no performance cost
- Transition `r` and `opacity` on the glow ring for smooth hover/select states

## Filter Architecture

- Unified filter in App.tsx: compute `activeIndices: Set<number>` from all filters combined
- MapDots receives `isFiltering` + `activeIndices` — stays dumb, only dims/brightens
- AND-Logik für Service-Filter: `[...activeServiceFields].every(f => s.services[f])`
- Anschluss-Filter + Suche + Mobilitätsangebote-Filter kombinierbar in einem `useMemo`
- Service-Chip-Farben als Hex-Map in `lib/colors.ts` (CSS vars unzuverlässig in inline styles/tooltip)

## Dropdown z-index über SVG

- Ein `position: absolute` Dropdown in einer Flex-Zeile wird von nachfolgenden SVG-Elementen überdeckt
- Fix 1: `overflow-x-auto` auf dem Container entfernen — das clipped absolute children
- Fix 2: Container bekommt `position: relative; z-index: 20` → schafft eigenen Stacking Context über der Karte
- Das SVG darunter hat kein eigenes z-index → bleibt im default stacking context (unter z-20)

## Programmatische Klicks in React (Preview-Tool)

- `element.click()` und `element.dispatchEvent(new MouseEvent('click', ...))` triggern React Synthetic Events NICHT zuverlässig im Preview-Tool
- Stattdessen: Stacking Context via computed styles prüfen (`getComputedStyle(el).zIndex`) um Fix zu verifizieren
- Oder: direkt DOM-Inhalt nach dem Click abfragen um zu prüfen ob der State sich geändert hat

## URL-Parameter für Stationsauswahl

- `window.history.replaceState(null, '', '?station=...')` — kein Page-Reload, nur URL-Update
- `encodeURIComponent(station.name)` für Stationsnamen mit Umlauten/Sonderzeichen
- Restore on mount: `useEffect` auf `stations` warten (leer beim ersten Render), dann URL lesen und passende Station selektieren
- Achtung: `handleSelect` braucht `stations` als Dependency im `useCallback`

## Dark-Mode Textfarben

- Sehr dunkle Textfarben (#4a6080, #5a7090) auf dunklem Hintergrund (#080d14) ergeben Kontrastverhältnis < 2:1 — unlesbar
- Faustregel für diese Palette: Muted-Text muss mindestens bei ~#7a90a8 liegen für 3:1, ~#8aacc4 für 4.5:1
- Primärfarbe (#d0ccc8) hat ausreichend Kontrast

## Code Review Patterns (2026-03-21)

### D3 Zoom: Nie mehrfach instanziieren
- d3.zoom() in `useCallback` handlers neu zu erstellen erzeugt getrennte Zoom-States → inconsistente Transitions
- Pattern: einmal in `useEffect` erstellen, in `useRef` speichern, in Callbacks über `zoomRef.current` zugreifen
- Cleanup: `zoomRef.current = null` im Effect-Return setzen

### Fetch-Errors in UI anzeigen
- `fetch().catch(console.error)` ist ein Anti-Pattern — User sieht nichts wenn Daten fehlen
- Pattern: `useState<string | null>(null)` für Error-State, in Catch setzen, in JSX rendern
- HTTP-Status prüfen: `if (!r.ok) throw new Error(...)` — fetch rejected nur bei Netzwerkfehlern, nicht bei 4xx/5xx

### React.memo für SVG-Heavy Components
- SVG-Komponenten mit 100+ Elementen (MapDots) profitieren stark von `React.memo`
- Voraussetzung: Eltern muss stabile Referenzen übergeben (`useCallback`, `useMemo`)
- Set<number> als Prop: referentielle Gleichheit nur wenn im Eltern memoized

### ESLint exhaustive-deps: Nie suppressen, stattdessen fixen
- `eslint-disable-next-line react-hooks/exhaustive-deps` → fast immer ein Bug
- Für "sync von außen"-Pattern: `useRef` für previous value tracken, Effect mit allen Deps
- Pattern: `prevRef.current` vergleichen um externe vs. eigene Änderungen zu unterscheiden

### Debounce für teure Berechnungen in Event-Handlern
- Levenshtein über alle Stations bei jedem Keystroke → 50ms+ Latenz
- Pattern: billige Operationen (substring match) sofort, teure (fuzzy scoring) mit 150ms debounce
- `useRef` für Timer, Cleanup im Unmount-Effect

### Station-Lookup: Map statt Array.find()
- `stations.find(s => s.stationIndex === i)` ist O(n) pro Render
- Pattern: `useMemo(() => new Map(stations.map(s => [s.stationIndex, s])), [stations])`
- Dann `stationByIndex.get(i)` → O(1)

### CSV-Parsing: Validierung vor Transformation
- Papa.parse gibt leere Strings für fehlende Felder zurück — keine Exception
- Pattern: `.filter()` vor `.map()` — Rows ohne Pflichtfelder (name, shape) rauswerfen
- Verhindert stille Invalid Records die downstream Bugs verursachen

### useMemo-Dependencies: So spezifisch wie möglich
- `districtCounts` hing von `districtPaths` ab (recalculated bei jeder Dimension-Änderung)
- Besser: direkt von `geojson` + `stations` abhängen — unabhängig von Screen-Dimensionen
- Faustregel: Memo-Deps sollten die tatsächliche Daten-Abhängigkeit abbilden, nicht die Compute-Chain

## Worktree

- Branch: `feature/map-viz` at `.worktrees/map-viz` (merged to main)
- Dev server: ports 5173–5177 oft belegt, aktuell 5178
