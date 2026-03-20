# UX High-Impact Improvements — Design Spec

**Date:** 2026-03-20
**Scope:** Three high-impact UX changes to improve exploration and discoverability
**Audience:** Urban planners / transport professionals + data viz portfolio
**Language:** All UI text in German

---

## 1. Animated Reveal Onboarding (Ring-by-Ring Build)

### Concept
On page load, instead of all arcs fading in simultaneously, the visualization builds itself ring by ring from inside out. Each ring draws across all stations before the next ring begins. No overlays, no text — the animation *is* the explanation.

### Behavior
1. Page loads → CSV parsed → layout computed
2. All arcs start with `opacity: 0`
3. Ring 0 (S-Bahn, innermost) fades in across all stations simultaneously (~400ms)
4. After a stagger delay (~120ms), Ring 1 (U-Bahn) fades in
5. This cascades through all 11 rings (total duration: ~400ms + 10 × 120ms = ~1600ms)
6. Station labels fade in after the last ring completes (+200ms delay)
7. After the reveal completes, the visualization transitions to its normal interactive state (pulse animation begins, hover enabled)

### Animation Timing
- **Ring fade-in duration:** 400ms ease-out each
- **Inter-ring stagger:** 120ms (rings overlap in animation)
- **Total ring reveal:** ~1600ms
- **Label fade-in:** 600ms ease-out, starts at ~1800ms
- **Pulse animation starts:** after labels finish fading in (~2400ms = 1800ms label start + 600ms label duration)
- **Interactions enabled:** at ~2400ms (same moment pulse begins — labels are done, everything is visible)

### Implementation Approach

**State machine in App.tsx:**
```
type VizPhase = 'loading' | 'revealing' | 'interactive'
```

- `loading`: data not yet available
- `revealing`: ring-by-ring animation in progress, interactions disabled
- `interactive`: normal state, all features enabled

**CSS approach — replace current `.station-entry` animation:**

The current animation staggers by angular position (station-by-station). The new animation staggers by ring index (ring-by-ring).

New CSS (opacity-only — intentionally drops the `translateY(4px)` from the old `.station-entry` because the ring-by-ring sequencing already provides visual rhythm):
```css
@keyframes ring-reveal {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.ring-reveal {
  opacity: 0;
  animation: ring-reveal 400ms ease-out forwards;
}
```

Each arc path gets `animation-delay: ringIndex * 120ms` instead of the current angular stagger.

**ServiceRings.tsx changes:**
- Accept `vizPhase` prop
- During `revealing`: apply `.ring-reveal` class with per-ring delay instead of `.station-entry`
- During `interactive`: remove reveal class, apply normal opacity logic
- Disable `onMouseEnter`/`onMouseLeave` during `revealing`

**StationLabels.tsx changes:**
- Accept `vizPhase` prop
- During `revealing`: labels hidden (opacity 0)
- Transition to visible after reveal completes (delay: ~1800ms, duration: 600ms)

**App.tsx changes:**
- Add `vizPhase` state, starts as `'loading'`
- When `layout` becomes available → set to `'revealing'`
- After total reveal duration (~2400ms) via `setTimeout` → set to `'interactive'`
- Pass `vizPhase` to `ServiceRings`, `StationLabels`, `CenterLabel`

### What gets removed
- Current `.station-entry` angular stagger animation (replaced by ring-reveal)
- Current immediate ring-pulse start (deferred until interactive)

---

## 2. Click-to-Select with Center Detail

### Concept
Click a station arc to lock the highlight. The center circle transitions to show that station's details (name, service count, active services). Click elsewhere or press Esc to deselect. Works on both mouse and touch.

### Center Label State Machine

> **Note:** Showing the station name in the center on hover is **new behavior** — the current CenterLabel only handles ring-hover labels. This requires a new `hoveredStationName` prop.

```
IDLE (title or cycling insights — see §3)
  → hover station  → show station name in center (NEW — not current behavior)
  → hover legend   → show service name (current behavior via hoveredRingLabel)
  → click station  → SELECTED: station detail in center
  → search active  → show match count ("X Treffer")

SELECTED
  → click same station  → back to IDLE (toggle)
  → click other station → SELECTED with new station
  → click background    → back to IDLE
  → press Escape        → back to IDLE
  → hover legend        → temporarily show service name, revert to SELECTED on leave
```

### Selected Station — Center Display
When a station is selected, the center circle shows:

```
[Station Name]              (bold, 9px, #c9d8e8)
―――――――――――――
7 von 11 Diensten          (7px, #4a7fa8)
● ● ● ● ○ ● ● ● ○ ○ ○     (colored dots for present/absent)
```

- Station name: truncated with ellipsis if too long for center radius
- Service count: computed by counting all `true` values in `station.services` (a `Record<string, boolean>`)
- Format: `"X von 11 Diensten"`
- Service dots: 11 small SVG circles in a row, iterating `SERVICE_DEFINITIONS` in order. Each dot colored with `svc.color` if `station.services[svc.field] === true`, otherwise dim fill `#1a2a45`
- Smooth crossfade transition (150ms) between states

> **Note:** `StationGeometry.services` only has boolean values, not colors. The component must import `SERVICE_DEFINITIONS` from `lib/colors.ts` to map field → color for the dots.

### Implementation

**New state in App.tsx:**
```typescript
const [selectedStationIndex, setSelectedStationIndex] = useState<number | null>(null)
```

**Click handler on ServiceRings arcs:**
- `onClick` on each arc `<path>`:
  - If same station already selected → deselect (set to `null`)
  - Otherwise → select this station
  - **Must call `e.stopPropagation()`** to prevent the click from bubbling to the SVG background (which would immediately deselect)
- Only active when `vizPhase === 'interactive'`

**Background click to deselect:**
- `onClick` on the `<svg>` element in `RadialViz.tsx` → calls `onBackgroundClick` which deselects
- Works because arc clicks call `e.stopPropagation()`, so only true background clicks reach this handler

**Escape key:**
- `useEffect` with `keydown` listener for `Escape` → deselect

**CenterLabel.tsx changes:**
- New props:
  - `selectedStation: StationGeometry | null`
  - `hoveredStationName: string | null` (NEW — derived from `hoveredStation?.name` in App.tsx)
  - `insights: string[]` (for idle cycling — see §3)
  - `isIdle: boolean` (true when no hover, no selection, no search active)
- Display priority: `selectedStation` > `hoveredStationName` > `hoveredRingLabel` > search count > idle insights
- When `selectedStation` is set: render station name, service count, service dots (importing `SERVICE_DEFINITIONS` for colors)
- When `hoveredStationName` is set: render station name centered (single line, same style as ring label)
- Crossfade between states using opacity transitions

**ServiceRings.tsx opacity logic update:**
Add `selectedStationIndex` to the opacity precedence:
```
1. selectedStationIndex (highest — locks highlight)
2. hoveredStationIndex
3. hoveredRingIndex
4. activeStationIndices (search)
5. default (0.85)
```

When selected:
- Selected station arcs: opacity 1, white stroke
- Other stations: opacity 0.15 (slightly higher than hover's 0.08, to keep context visible)

**StationLabels.tsx:**
- Same opacity logic as ServiceRings — selected station label full opacity, others dimmed

**Touch support:**
- The `onClick` handler on arc paths works natively on touch
- No hover equivalent needed — tap selects, tap elsewhere deselects
- Tooltip should also show on selection (not just hover)

**Tooltip integration:**
- When a station is selected, show tooltip at a **fixed position** derived from the station's geometric center:
  - Compute screen position from `station.midAngle` and `layout.ringZoneOuterR` + offset
  - Store as `tooltipPos: { x: number, y: number } | null` in App state
  - On click-select: set `tooltipPos` from station geometry (converted to screen coords via SVG container offset)
  - On deselect: clear `tooltipPos`
- Tooltip component receives both `mousePos` (for hover) and `tooltipPos` (for selection), preferring `tooltipPos` when set
- On desktop: tooltip follows mouse during hover, but snaps to fixed position on click-select

---

## 3. Auto-Rotating Insights in Center (Idle State)

### Concept
When nothing is hovered or selected, the center cycles through computed data insights every ~4 seconds with a crossfade. Pauses on any interaction, resumes after ~5s of inactivity.

### Insight Computation
Insights are derived from the parsed station data at layout time. They should be computed once and stored.

**Proposed insights (in German):**

1. **Station count:** `"137 Stationen · 11 Dienste"` (always first)
2. **Rarest service:** `"Nur 5 Stationen mit On-demand Shuttle"` (find service with lowest count)
3. **Most common service:** `"124 Stationen mit Bus-Anbindung"` (find service with highest count)
4. **Best-connected group:** `"S-Bahn-Stationen: ∅ 8,2 Dienste"` — group by `station.groupKey` (values: `'s-bahn' | 'u-bahn' | 'tram' | 'bus' | 'none'`), compute avg count of `true` services per group, pick the highest. Use `GROUP_LABELS[groupKey]` for the display name.
5. **Micro-mobility coverage:** `"23 Stationen mit Bikesharing + Leihscooter + Mietrad"` — count stations where all three fields are `true`: `gaf_bs_vorhanden`, `gaf_ls_vorhanden`, `gaf_ms_vorhanden`
6. **Full-service stations:** `"4 Stationen mit allen 11 Diensten"` — count stations where all 11 `SERVICE_DEFINITIONS[].field` values are `true`. Skip this insight if count is 0.

### Computation
New utility function `computeInsights(stations: StationGeometry[]): string[]`:
- Lives in `src/lib/insights.ts`
- Takes the station array from layout
- Returns an array of German-language insight strings
- Numbers use German formatting (comma as decimal separator)

### Display
- Center label shows one insight at a time
- Crossfade transition: current fades out (200ms), next fades in (200ms)
- Cycle interval: 4000ms
- Font: same as current center label (7-9px range)
- Two-line layout if needed (insight text can wrap within center circle)

### Interaction Pausing
- Any hover (station or legend), click-select, or active search → immediately switch to the relevant display (station name, service name, etc.)
- When interaction ends (mouse leaves, deselect, search cleared) → wait 5000ms of inactivity → resume cycling from next insight
- Timer resets on each new interaction

### Implementation

**New file `src/lib/insights.ts`:**
```typescript
export function computeInsights(stations: StationGeometry[]): string[] { ... }
```

**CenterLabel.tsx changes:**
- Accept `insights: string[]` prop
- Internal state: `currentInsightIndex` + interval timer
- Pause/resume logic based on whether `hoveredRingLabel`, `selectedStation`, or search is active
- Crossfade between insights using two overlapping `<text>` elements with alternating opacity

**App.tsx changes:**
- Compute insights once via `useMemo` when layout is available
- Pass to `CenterLabel`

### Center Label Priority (complete)

> All items below priority 1 are **transient** (revert when the trigger ends). Priority 4 ("X Treffer") is **new behavior** not in the current codebase — CenterLabel must accept a `searchMatchCount: number` prop from App.tsx (derived from `activeStationIndices.size`).

```
1. selectedStation (click-locked)         → station detail view (name + service dots)
2. hoveredStationName (station hover)     → station name centered (NEW)
3. hoveredRingLabel (legend hover)        → service name (existing)
4. searchActive (search has results)      → "X Treffer" (NEW — shows activeStationIndices.size)
5. vizPhase === 'revealing'               → "MÜNCHEN Mobilitätspunkte" (static title)
6. idle                                   → cycling insights (NEW)
```

---

## File Change Summary

| File | Change |
|------|--------|
| `src/App.tsx` | Add `vizPhase`, `selectedStationIndex` state; compute insights; wire click/Escape handlers |
| `src/components/CenterLabel.tsx` | Major rewrite: support 6 display states, insight cycling, selected station detail |
| `src/components/ServiceRings.tsx` | Add `vizPhase` + `selectedStationIndex` props; ring-reveal animation; click handler; updated opacity logic |
| `src/components/StationLabels.tsx` | Add `vizPhase` + `selectedStationIndex` props; deferred label reveal; updated opacity logic |
| `src/components/RadialViz.tsx` | Pass through new props: `vizPhase`, `selectedStationIndex`, `onStationClick`, `onBackgroundClick`, `insights`, `hoveredStationName`, `isIdle`; add `onClick` on `<svg>` for background deselect |
| `src/lib/insights.ts` | **New file** — `computeInsights()` |
| `src/index.css` | Replace `.station-entry` with `.ring-reveal`; defer `.ring-pulse` start |
| `src/components/Tooltip.tsx` | Show on selected station (not just hover) |

---

## Open Questions
- Should the ring-reveal animation replay on window resize, or only on first load?
  → **Recommendation:** Only on first load (use a ref to track)
- Should click-select work during search (selecting a search result)?
  → **Recommendation:** Yes — clicking a highlighted search result selects it, clearing the search
- Max text length for station names in center circle?
  → **Recommendation:** Truncate at ~20 characters with ellipsis, based on center circle radius
