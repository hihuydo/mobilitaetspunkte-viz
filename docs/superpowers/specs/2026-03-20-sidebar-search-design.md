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

## Sidebar

- **Width:** 220px, full viewport height
- **Background:** `#0a1220` (slightly darker than viz bg `#0f1b2d`), subtle left border `1px solid rgba(255,255,255,0.06)`
- **Padding:** 16px
- **Layout (top → bottom):**
  1. `<SearchBar>` component
  2. Subtle divider (`1px solid rgba(255,255,255,0.08)`, margin 16px 0)
  3. "SERVICE RINGS (inner → outer)" label
  4. 11 legend items — vertical list, same hover interaction as before

---

## SearchBar Component (`src/components/SearchBar.tsx`)

### Input

- Full-width dark input, no border radius or softness — consistent with editorial aesthetic
- Placeholder: `"Station suchen…"`
- Clear (×) button appears when query is non-empty; clicking clears input and resets search state
- `fontSize: 13px`, monospaced or sans-serif consistent with rest of UI

### Search Logic — Two Phase

**Phase 1 — Substring match (primary):**
- Case-insensitive substring match against `station.name` for all 116 stations
- If ≥1 match: pass matching station indices to viz as `activeStationIndices: Set<number>`
- "Meinst du?" suggestion is hidden

**Phase 2 — Levenshtein fuzzy fallback:**
- Triggered only when query is non-empty AND Phase 1 yields zero matches
- Compute Levenshtein distance between `query.toLowerCase()` and each `station.name.toLowerCase()`
- Surface top 1 result (lowest distance). If two results share the same minimum distance, show both (max 2).
- Display: `"Meinst du: [Station Name]?"` rendered below the input as a clickable suggestion

### "Meinst du?" Interaction

- Clicking a suggestion:
  1. Fills the search input with the station name
  2. Triggers Phase 1 match → that station is highlighted in the viz
  3. Suggestion disappears (Phase 1 now has a result)

### Levenshtein Implementation

Pure JS, no library. Iterative DP matrix, ~20 lines. Lives inside `SearchBar.tsx` or extracted to `src/lib/levenshtein.ts`.

---

## Opacity Logic (Search State)

When `activeStationIndices` is non-empty (active search with results):

- **ServiceRings:** matching station arcs → full opacity (1.0); non-matching → 0.08. Ring hover still works on top.
- **StationLabels:** matching station labels → full opacity (1.0); non-matching → 0.08.
- **Hover interaction coexists:** hovering a station or ring still changes opacity as per existing logic, but search dimming applies to non-matching stations regardless.

When query is empty or no active search: normal state (no dimming).

---

## Legend — Vertical Layout

`Legend.tsx` is updated to render items in a **vertical list** (`flex-direction: column`, `gap: 8px`) instead of a horizontal wrapping row. The "SERVICE RINGS" label stays above the list. Dot + label layout per item is unchanged. Hover interaction is unchanged.

The `minHeight: 48` constraint is removed (no longer needed in sidebar context).

---

## State in App

```ts
// New state
const [searchQuery, setSearchQuery] = useState('')
const [activeStationIndices, setActiveStationIndices] = useState<Set<number>>(new Set())
```

- `searchQuery` → passed to `SearchBar` (controlled input)
- `activeStationIndices` → passed to `RadialViz` → `ServiceRings` + `StationLabels`
- `SearchBar` calls `onSearch(query, matchingIndices)` to update both pieces of state

---

## Component Changes Summary

| Component | Change |
|---|---|
| `App.tsx` | Layout → row flex; add `searchQuery` + `activeStationIndices` state; render `<Sidebar>` instead of `<Legend>` |
| `Legend.tsx` | Vertical layout; remove `minHeight: 48` |
| `SearchBar.tsx` | **New** — input, clear button, two-phase search logic, fuzzy suggestion |
| `Sidebar.tsx` | **New** — thin wrapper: SearchBar + divider + Legend |
| `RadialViz.tsx` | Accept + pass down `activeStationIndices` prop |
| `ServiceRings.tsx` | Add search dimming to opacity logic |
| `StationLabels.tsx` | Add search dimming to opacity logic |

---

## What Is NOT Changing

- Tooltip behavior (hover → tooltip)
- Ring hover highlight behavior
- Station hover highlight behavior
- InfoPanel (info/help overlay)
- Connector lines between rings and labels
- All existing animations and transitions

---

## Success Criteria

1. Legend is vertical in right sidebar — no bottom strip remains
2. Typing a station name highlights matching stations and dims all others
3. Typing a near-miss (e.g. "Münchner Fryhait") shows "Meinst du: Münchner Freiheit?"
4. Clicking suggestion fills input and highlights that station
5. Clearing search restores all stations to normal opacity
6. Ring hover and station hover still work correctly alongside search state
