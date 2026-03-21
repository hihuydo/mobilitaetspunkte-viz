# UX Improvements — 9 Items Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan.

**Goal:** Implement 9 UX improvements to increase clarity and discoverability of the Munich mobility visualization.

**Architecture:** All changes are additive. State lifting is minimal — only Items 4 and 7 require new props through the component tree. Items 1, 2, 3, 6, 8 are self-contained component edits. Item 9 touches App.tsx only. Item 5 requires one new callback prop on DetailPanel.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v4, D3 7, proj4

---

## File Map

| File | Changes |
|------|---------|
| `src/lib/colors.ts` | Add `SERVICE_HEX` hex map (shared for tooltip + filter) |
| `src/lib/mapLayout.ts` | Add `lonlat: [number, number]` to MapStation for district hit-testing |
| `src/App.tsx` | URL params (#9), group counts (#7), onFilterService→DetailPanel (#5), empty state (#2) |
| `src/components/ServiceFilter.tsx` | Service chips dropdown (#1), group count badges (#7) |
| `src/components/MapTooltip.tsx` | Service dots (#3) |
| `src/components/MapBackground.tsx` | District station count (#4) |
| `src/components/MapViz.tsx` | Pass stations to MapBackground (#4) |
| `src/components/MapDots.tsx` | Selected dot visual hierarchy (#6) |
| `src/components/NavBar.tsx` | Search live counter (#8) |
| `src/components/DetailPanel.tsx` | "Nur anzeigen →" buttons (#5) |

---

## Task 1: Shared SERVICE_HEX in colors.ts

**Files:** Modify `src/lib/colors.ts`

- [ ] Add `SERVICE_HEX` record to `colors.ts` (hex values, not CSS vars — needed for inline SVG/tooltip):
```ts
export const SERVICE_HEX: Record<string, string> = {
  s_bahn_vorhanden:            '#00A651',
  u_bahn_vorhanden:            '#0072BC',
  tram_vorhanden:              '#CC0000',
  bus_vorhanden:               '#F7941D',
  ods_vorhanden:               '#9B59B6',
  gaf_ts_vorhanden:            '#E91E63',
  gaf_bs_vorhanden:            '#FFD600',
  gaf_ls_vorhanden:            '#00BCD4',
  gaf_ms_vorhanden:            '#FF8A65',
  radservicestation_vorhanden: '#80CBC4',
  radpumpe_vorhanden:          '#B0BEC5',
}
```
- [ ] In `ServiceFilter.tsx`: remove local `SERVICE_HEX` and import from `../lib/colors`

---

## Task 2: lonlat field on MapStation (for district count)

**Files:** Modify `src/lib/mapLayout.ts`

- [ ] Add `lonlat: [number, number]` to `MapStation` interface
- [ ] In `computeMapLayout`, convert UTM coords to WGS84 using proj4 and store:
```ts
import proj4 from 'proj4'
const WGS84 = '+proj=longlat +datum=WGS84 +no_defs'
const EPSG25832 = '+proj=utm +zone=32 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
// inside the map():
const [lon, lat] = proj4(EPSG25832, WGS84, [s.coords.x, s.coords.y])
// add to returned object:
lonlat: [lon, lat] as [number, number],
```

---

## Task 3: District hover station count (#4)

**Files:** Modify `src/components/MapBackground.tsx`, `src/components/MapViz.tsx`

- [ ] Add `stations: MapStation[]` prop to `MapBackground`
- [ ] Import `geoContains` from `d3`
- [ ] Compute count on hover: when `isHovered`, count `stations.filter(s => geoContains(feature, s.lonlat)).length`
  - Do this per-feature in the render (memoize with useMemo keyed on geojson+stations)
  - Build a `Map<string, number>` of district name → count once
- [ ] Show count in district label: `{name} · {count}`
- [ ] In `MapViz.tsx`: accept `stations` prop and pass to `MapBackground`
- [ ] In `App.tsx`: pass `stations={stations}` to `MapViz`

```tsx
// MapViz props addition:
stations: MapStation[]
// MapBackground usage:
<MapBackground ... stations={stations} />
```

---

## Task 4: Service chips dropdown (#1)

**Files:** Modify `src/components/ServiceFilter.tsx`

- [ ] Add `showServices` state (default `false`)
- [ ] Replace the inline service chips section with a toggle button:
  ```tsx
  <button onClick={() => setShowServices(v => !v)} className="...">
    Dienste {activeServices.size > 0 && <span>({activeServices.size})</span>} {showServices ? '▲' : '▼'}
  </button>
  ```
- [ ] Render service chips in a `fixed` positioned dropdown div when `showServices` is true
- [ ] Click outside to close: use a `useEffect` with `mousedown` listener or a backdrop div
- [ ] Show active service count badge on the toggle button when chips are hidden

---

## Task 5: Group chip count badges (#7)

**Files:** Modify `src/App.tsx`, `src/components/ServiceFilter.tsx`

- [ ] In `App.tsx`, compute `groupCounts`:
```ts
const groupCounts = useMemo(() => {
  const counts: Record<string, number> = {}
  for (const s of stations) {
    counts[s.groupKey] = (counts[s.groupKey] ?? 0) + 1
  }
  return counts
}, [stations])
```
- [ ] Pass `groupCounts={groupCounts}` to `ServiceFilter`
- [ ] In `ServiceFilter`, add `groupCounts?: Record<string, number>` to props
- [ ] Show count in group chip: `{chip.label} ({groupCounts?.[chip.key] ?? 0})`

---

## Task 6: Tooltip service dots (#3)

**Files:** Modify `src/components/MapTooltip.tsx`

- [ ] Import `SERVICE_DEFINITIONS` and `SERVICE_HEX` from `../lib/colors`
- [ ] Below the station name + count row, add a row of colored dots for active services:
```tsx
<div style={{ display: 'flex', gap: 3, paddingLeft: 14, marginTop: 4 }}>
  {SERVICE_DEFINITIONS
    .filter(svc => station.services[svc.field])
    .map(svc => (
      <span key={svc.field} style={{
        width: 6, height: 6, borderRadius: '50%',
        background: SERVICE_HEX[svc.field] ?? '#888',
        flexShrink: 0,
      }} />
    ))
  }
</div>
```
- [ ] Increase `TOOLTIP_H` from 60 to 80 to account for extra height

---

## Task 7: Selected dot visual hierarchy (#6)

**Files:** Modify `src/components/MapDots.tsx`

- [ ] Make selected outer ring more prominent: increase opacity from 0.3 → 0.6, strokeWidth from `inv` → `1.5 * inv`
- [ ] Add a second inner highlight ring for selected (small bright ring right on the dot edge):
```tsx
{isSelected && (
  <circle cx={s.sx} cy={s.sy} r={(s.r + 2) * inv}
    fill="none" stroke="white" strokeWidth={0.8 * inv} opacity={0.4} pointerEvents="none" />
)}
```

---

## Task 8: Empty state overlay (#2)

**Files:** Modify `src/App.tsx`

- [ ] After `<MapViz>`, add:
```tsx
{isFiltering && activeIndices.size === 0 && (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
    <div className="flex flex-col items-center gap-2 p-5 rounded-xl border text-center pointer-events-auto"
      style={{ background: 'var(--map-surface)', borderColor: 'var(--map-border)' }}>
      <p className="text-[13px] font-semibold" style={{ color: 'var(--map-text-primary)' }}>
        Keine Stationen gefunden
      </p>
      <p className="text-[11px]" style={{ color: 'var(--map-text-dim)' }}>
        Filterkomination ergibt keine Treffer
      </p>
      <button onClick={handleResetServices}
        className="mt-1 text-[10px] px-3 py-1 rounded border transition-colors"
        style={{ borderColor: 'var(--map-border)', color: 'var(--map-text-muted)' }}>
        Filter zurücksetzen
      </button>
    </div>
  </div>
)}
```

---

## Task 9: "Nur anzeigen" buttons in idle panel (#5)

**Files:** Modify `src/components/DetailPanel.tsx`, `src/App.tsx`

- [ ] Add `onFilterService?: (field: string) => void` to `DetailPanelProps`
- [ ] Pass it down: `DetailPanel` → `IdleContent` as prop
- [ ] In `IdleContent`, for each row in `topServices` and `rarestServices`, add a small button:
```tsx
{onFilterService && (
  <button onClick={() => onFilterService(field)}
    className="text-[9px] px-1.5 py-0.5 rounded border ml-auto flex-shrink-0"
    style={{ borderColor: 'var(--map-border)', color: 'var(--map-text-dim)' }}>
    → anzeigen
  </button>
)}
```
- [ ] In `App.tsx`: pass `onFilterService={handleToggleService}` to `DetailPanel`

---

## Task 10: Search live counter in NavBar (#8)

**Files:** Modify `src/components/NavBar.tsx`

- [ ] When `searchQuery !== ''`, show a small match count badge to the right of the search input:
```tsx
{searchQuery !== '' && (
  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] tabular-nums"
    style={{ color: 'var(--map-text-dim)' }}>
    {matchCount}
  </span>
)}
```
- [ ] Add `matchCount` prop to NavBar (already exists) — just render it in this new location

---

## Task 11: URL params for station (#9)

**Files:** Modify `src/App.tsx`

- [ ] On mount: read `?station=` from URL, find matching station by name, set `selectedIndex`
```ts
useEffect(() => {
  if (stations.length === 0) return
  const params = new URLSearchParams(window.location.search)
  const name = params.get('station')
  if (!name) return
  const match = stations.find(s => s.name.toLowerCase() === name.toLowerCase())
  if (match) setSelectedIndex(match.stationIndex)
}, [stations])
```
- [ ] On select: update URL
```ts
const handleSelect = useCallback((i: number) => {
  setSelectedIndex(prev => {
    const next = prev === i ? null : i
    const station = stations.find(s => s.stationIndex === i)
    if (next !== null && station) {
      const params = new URLSearchParams({ station: station.name })
      window.history.replaceState(null, '', `?${params}`)
    } else {
      window.history.replaceState(null, '', window.location.pathname)
    }
    return next
  })
}, [stations])
```
- [ ] On deselect: clear URL param
```ts
const handleDeselect = useCallback(() => {
  setSelectedIndex(null)
  window.history.replaceState(null, '', window.location.pathname)
}, [])
```

---

## Execution Order

1. Task 1 (colors.ts SERVICE_HEX) — foundation for tooltip
2. Task 2 (lonlat on MapStation) — foundation for district count
3. Tasks 3–11 in any order (all independent after 1+2)

## Verification

- `pnpm build` — no TS errors
- Service chips dropdown opens/closes, active count shows on button
- Hovering district shows name + station count
- Tooltip shows colored dots
- Group chips show count badges
- Empty state appears when filter gives 0 results
- Selecting a station updates URL; reloading with ?station= restores selection
- "→ anzeigen" in idle panel activates that service filter
- Typing in search shows live match count next to input
- Selected dot has stronger visual ring vs hovered
