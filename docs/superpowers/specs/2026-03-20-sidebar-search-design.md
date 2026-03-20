# Spec: Right Sidebar, Legend Relocation & Station Search
Date: 2026-03-20
Status: Approved by user

---

## Overview

Relocate the bottom legend strip to a fixed right sidebar (220px) and add a station search bar with fuzzy "Meinst du?" suggestion support. The sidebar becomes the primary UI chrome alongside the radial visualization.

---

## Layout Change

**Before:** `flex-direction: column` — SVG container (flex:1) + bottom legend strip.

**After:** `flex-direction: row` — SVG container (flex:1, full height) + right sidebar (220px fixed width, full height).

The bottom `<Legend>` strip is removed from App. The sidebar is a new `<Sidebar>` component containing `<SearchBar>` + `<Legend>` (vertical variant).

---

## Sidebar (`src/components/Sidebar.tsx`)

**Props:**
```ts
interface SidebarProps {
  stations: StationGeometry[]
  searchQuery: string           // pass-through to SearchBar; Sidebar itself never reads it
  onSearch: (query: string, matchingIndices: Set<number>) => void
  hoveredRingIndex: number | null
  isStationHover: boolean
  onRingEnter: (index: number) => void
  onRingLeave: () => void
}
```

Ring hover events originate from `<Legend>` inside `<Sidebar>` and are lifted to App via `onRingEnter`/`onRingLeave` props on Sidebar. `RadialViz` only receives the resulting `hoveredRingIndex` read-only — it never emits ring events.

`searchQuery` is threaded through `Sidebar` (rather than wired directly from App to SearchBar) because `SearchBar` is a child of `Sidebar` — App cannot reach it directly without either lifting it out of Sidebar or threading the prop.

The App-level `onMouseMove` handler (for tooltip position tracking) covers the full layout div including the new sidebar. This is intentional — `clientX/clientY` is viewport-relative so sidebar hover does not affect tooltip accuracy. No scope change needed.

- **Width:** 220px, full viewport height
- **Background:** `#0a1220`, subtle left border `1px solid rgba(255,255,255,0.06)`
- **Padding:** 16px
- **Layout (top → bottom):**
  1. `<SearchBar>` — receives `stations`, `searchQuery`, `onSearch`
  2. Subtle divider (`1px solid rgba(255,255,255,0.08)`, margin 16px 0)
  3. "SERVICE RINGS (inner → outer)" label
  4. `<Legend>` — receives `hoveredRingIndex`, `isStationHover`, `onRingEnter`, `onRingLeave`

---

## SearchBar Component (`src/components/SearchBar.tsx`)

### Props
```ts
interface SearchBarProps {
  stations: StationGeometry[]   // full list for search and fuzzy match
  searchQuery: string           // controlled value from App — used only to sync input on external change
  onSearch: (query: string, matchingIndices: Set<number>) => void
}
```

`SearchBar` maintains internal `inputValue` state. When the user types, it calls `onSearch(newValue, matchingIndices)` synchronously.

**Syncing external changes (suggestion click path):**
Use a `useEffect` that watches `searchQuery`. When `searchQuery !== inputValue`, set `inputValue = searchQuery`. The guard `searchQuery !== inputValue` is **required** — without it, every keystroke echoes back through App as a prop change and triggers the effect, creating a redundant second set. The "Meinst du?" click handler calls `onSearch(stationName, indices)` only — it does NOT call `setInputValue` directly; the guarded `useEffect` handles the sync.

### Input Styling
- Full-width, `background: rgba(255,255,255,0.05)`, `border: 1px solid rgba(255,255,255,0.12)`
- No border-radius (sharp corners, editorial aesthetic)
- `color: #c9d8e8`, `fontSize: 13px`
- Placeholder `"Station suchen…"` in `rgba(138,180,212,0.5)`
- Clear (×) button appears when `inputValue` is non-empty; clicking calls `onSearch('', new Set())`

### Search Logic — Two Phase

**Phase 1 — Substring match (primary):**
- Case-insensitive substring: `station.name.toLowerCase().includes(query.toLowerCase())`
- `stationIndex` (assigned sequentially in `computeLayout`) is the canonical identity key
- Build `matchingIndices = new Set(matchingStations.map(s => s.stationIndex))`
- If ≥1 match: call `onSearch(query, matchingIndices)`. No fuzzy suggestion shown.

**Phase 2 — Word-tokenized Levenshtein fuzzy fallback:**
- Triggered only when: `query.length >= 3` AND Phase 1 yields zero matches
- For `query.length < 3` with zero matches: call `onSearch(query, new Set())`, no suggestion, no crash
- **Matching strategy:** split each `station.name` on spaces and hyphens into word tokens. Compute Levenshtein distance between `query.toLowerCase()` and each token. Station score = minimum distance across all its tokens. This avoids full-name length mismatch (e.g. "Fryhait" correctly scores against "Freiheit" in "Münchner Freiheit").
- Find minimum score across all 116 stations
- Collect all stations with that minimum score; show at most 2, sorted alphabetically — no "…more" indicator
- Display as clickable element(s) below the input: `"Meinst du: [Name]?"`

### "Meinst du?" Interaction

- Rendered only during Phase 2 (non-empty query ≥3 chars, zero substring matches)
- Clicking a suggestion calls `onSearch(station.name, new Set([station.stationIndex]))` only
- The guarded `useEffect` syncs `inputValue` to the new `searchQuery` on the next render
- If 2 suggestions: each independently clickable

### Levenshtein Implementation

Pure JS, no library. Extracted to `src/lib/levenshtein.ts`:
```ts
export function levenshtein(a: string, b: string): number
```
Iterative DP matrix, O(m×n).

---

## Opacity Priority Ladder

**`isSearchActive` definition:** computed locally inside `ServiceRings` and `StationLabels` as `activeStationIndices.size > 0`. Do NOT add a separate `isSearchActive: boolean` prop — derive it from `activeStationIndices` in each component.

**When ring hover is active, search dimming is entirely suppressed** — `activeStationIndices` is ignored in the opacity calculation. Ring hover (Priority 2) always wins over search (Priority 3).

### Arc segments (ServiceRings)

The existing `ServiceRings` opacity logic has two levels: (1) an outer `if/else` over `isStationHover → isRingHover → else` that sets `stationOpacity`, and (2) an inner `if/else` per arc path (`if (isRingHover) { per-ring values } else { opacity = stationOpacity }`). Insert search as a new `else if (isSearchActive)` branch **in the outer block only** — between `isRingHover` and the default `else`. Priority 3 sets `stationOpacity` (matching: 1.0, non-matching: 0.08), which then flows into the inner `else { opacity = stationOpacity }` branch unchanged. **No changes needed inside the inner per-path block.** Do NOT add a `<g opacity={stationOpacity}>` wrapper — existing code applies opacity per `<path>` directly.

| Priority | Condition | Per-path opacity |
|---|---|---|
| 1 | Station hover — hovered station | 1.0 |
| 1 | Station hover — other stations | 0.08 |
| 2 | Ring hover (no station hover) — all paths | per-ring: hovered ring with service=1.0, hovered ring no service=0.05, other rings=0.15 |
| 3 | `isSearchActive` (no hover) — matching station paths | 1.0 |
| 3 | `isSearchActive` (no hover) — non-matching station paths | 0.08 |
| 4 | Default | 0.85 |

Priority 2 values (`0.15` other rings, `0.05` hovered ring without service) match existing code — no change.

### Labels (StationLabels)

`StationLabels` receives `isRingHover: boolean` (not `hoveredRingIndex`) — this existing prop shape is unchanged. Add `activeStationIndices: Set<number>` as the only new prop. Insert search as a new `else if (isSearchActive)` branch in the existing `if/else` chain:

| Priority | Condition | Opacity | Fill |
|---|---|---|---|
| 1 | Station hover — hovered label | 1.0 | `#c9d8e8` |
| 1 | Station hover — other labels | 0.2 | `#6a94b0` |
| 2 | Ring hover (no station hover) | 0.3 | `#6a94b0` |
| 3 | `isSearchActive` (no hover) — matching label | 1.0 | `#c9d8e8` |
| 3 | `isSearchActive` (no hover) — non-matching label | 0.08 | `#6a94b0` |
| 4 | Default | 1.0 | `#6a94b0` |

Values for Priority 1 (0.2), Priority 2 (0.3), and fills match existing code — no change to those branches.

### Connector lines

Connector lines: **unaffected by search dimming**. They only respond to existing station hover logic. No change.

---

## RadialViz Props Update

`hoveredRingIndex` is already wired App → RadialViz → ServiceRings (existing, unchanged). Only `activeStationIndices` is new. The existing optional props (`hoveredStationIndex?`, `onStationEnter?`, `onStationLeave?`) remain optional — do not change their optionality:

```ts
interface RadialVizProps {
  layout: LayoutResult
  groups: StationGroup[]
  width: number
  height: number
  hoveredRingIndex: number | null       // existing, no change
  hoveredStationIndex?: number | null   // existing optional, no change
  activeStationIndices: Set<number>     // NEW — required
  onStationEnter?: (index: number) => void
  onStationLeave?: () => void
}
```

`RadialViz` passes `activeStationIndices` to `ServiceRings` and `StationLabels`.

Import paths for new components: `StationGeometry` comes from `'../lib/layout'` in both `Sidebar.tsx` and `SearchBar.tsx`.

---

## Legend — Vertical Layout

`Legend.tsx` changes:
- **Outer container:** remove `minHeight: 48`; change `alignItems` to `'flex-start'`; change `justifyContent` to `'flex-start'` (items stack from top, not vertically centered); `padding: 0`. `flexDirection: 'column'` is already set — no change.
- **`containerOpacity` fade** (0.5 default → 1.0 on hover): **preserved** — keep this behavior in the sidebar context.
- **Inner items `<div>`** (mapping `SERVICE_DEFINITIONS`): currently `flexDirection: 'row'`, `flexWrap: 'wrap'`, `justifyContent: 'center'`, `gap: '4px 12px'`. Change to: `flexDirection: 'column'`, `gap: 8`, remove `flexWrap` and `justifyContent: 'center'`.
- Remove "SERVICE RINGS" label from Legend — moved to Sidebar
- Hover interaction otherwise unchanged

---

## State in App

```ts
const [searchQuery, setSearchQuery] = useState('')
const [activeStationIndices, setActiveStationIndices] = useState<Set<number>>(new Set())

const handleSearch = useCallback((query: string, indices: Set<number>) => {
  setSearchQuery(query)
  setActiveStationIndices(indices)
}, [])
```

App JSX wiring:
```tsx
<Sidebar
  stations={layout ? layout.stations : []}
  searchQuery={searchQuery}
  onSearch={handleSearch}
  hoveredRingIndex={hoveredRingIndex}
  isStationHover={hoveredStationIndex !== null}
  onRingEnter={setHoveredRingIndex}
  onRingLeave={handleRingLeave}
/>

<RadialViz
  ...existing props...
  activeStationIndices={activeStationIndices}
/>
```

`handleRingLeave` (existing `useCallback(() => setHoveredRingIndex(null), [])`) is unchanged — just passed to Sidebar instead of Legend directly.

---

## Component Changes Summary

| Component | Change |
|---|---|
| `App.tsx` | Layout → row flex; add search state; pass `onRingEnter`/`onRingLeave` to `<Sidebar>` (not Legend); add `activeStationIndices` to RadialViz |
| `Legend.tsx` | Inner items wrapper → vertical column; remove `minHeight`; remove "SERVICE RINGS" label; align left |
| `Sidebar.tsx` | **New** — SearchBar + divider + "SERVICE RINGS" label + Legend; passes all hover props to Legend |
| `SearchBar.tsx` | **New** — guarded `useEffect` sync, two-phase search, word-tokenized Levenshtein, suggestion UI, clear button |
| `src/lib/levenshtein.ts` | **New** — pure `levenshtein(a, b): number` |
| `RadialViz.tsx` | Add `activeStationIndices: Set<number>` to props; pass to ServiceRings + StationLabels |
| `ServiceRings.tsx` | Add `activeStationIndices`; insert Priority 3 `else if (isSearchActive)` branch |
| `StationLabels.tsx` | Add `activeStationIndices`; insert Priority 3 `else if (isSearchActive)` branch |
| Connector logic | **No change** |

---

## What Is NOT Changing

- Tooltip, hover transitions, connector lines, InfoPanel
- `hoveredRingIndex` wiring App → RadialViz
- `StationLabels` prop shape for ring hover (`isRingHover: boolean`, not `hoveredRingIndex`)
- Priority 1/2 opacity values — existing code values are authoritative

---

## Success Criteria

1. Legend is vertical in right sidebar — no bottom strip
2. Typing ≥1 char with substring match: matching stations at 1.0, others at 0.08
3. `activeStationIndices.size === 0` → no dimming, regardless of query text
4. Typing ≥3 chars with no match: "Meinst du: [Name]?" shown (top 1–2 alphabetically)
5. Typing 1–2 chars with no match: no suggestion, no crash, no dimming
6. Clicking suggestion: input syncs via guarded `useEffect`, station highlighted
7. Clearing search: all stations back to default
8. Ring hover overrides search dimming (Priority 2 > Priority 3)
9. Station hover overrides everything (Priority 1)
10. Connector lines unaffected
