# Interactive Reveal Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three high-impact UX features: ring-by-ring load animation with phase-gated interactions, click-to-select stations with center detail, and auto-rotating German insights in the center when idle.

**Architecture:** Feature 1 introduces a `VizPhase` state machine (`'loading' | 'revealing' | 'interactive'`) in App.tsx that gates interactions and controls the ring-reveal CSS animation. Feature 2 adds `selectedStationIndex` state and rewrites `CenterLabel` to handle 6 display states. Feature 3 adds a `computeInsights` utility in `src/lib/insights.ts` that computes German insight strings from station data, cycled in `CenterLabel` with a 5s resume timer. All UI text in German.

**Tech Stack:** React 18, TypeScript, D3 (layout only), Tailwind v4, SVG inline rendering, CSS custom properties (`--viz-*`), `setTimeout`/`setInterval` for animation phasing.

---

## Chunk 1: Ring-by-ring reveal + VizPhase state machine

### Task 1: Replace station-entry with ring-reveal animation and add VizPhase to CSS

**Files:**
- Modify: `src/index.css`

**Context:**
- Current `.station-entry` uses `station-fade-in` (opacity + translateY 4px), staggered by angular position.
- New `.ring-reveal` is opacity-only, no translateY. Each arc `<path>` gets `animation-delay: ringIndex * 120ms`.
- `.ring-pulse` (brightness breath) must be deferred until `vizPhase === 'interactive'` — a CSS class `.rings-interactive` on the `<g>` will enable it.
- Total ring reveal: ~400ms + 10 × 120ms = ~1600ms. Labels start at 1800ms.

- [ ] **Step 1: Update `index.css`**

Replace the `station-fade-in` keyframe and `.station-entry` class:

```css
/* Ring-by-ring reveal: arc-level, staggered by ring index */
@keyframes ring-reveal {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.ring-reveal {
  opacity: 0;
  animation: ring-reveal 400ms ease-out forwards;
}

/* Entry animation for station labels (same keyframe, different timing) */
@keyframes station-label-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.station-label-entry {
  animation: station-label-in 600ms ease-out both;
}
```

Remove the old `station-fade-in` keyframe and `.station-entry` class entirely.

Update the `.ring-pulse` rule — it should only run when the `<g>` has `.rings-interactive`:

```css
/* Ring pulse only active after reveal completes */
.rings-interactive .ring-pulse {
  animation: ring-pulse 3.5s ease-in-out infinite;
}

/* Override: freeze pulse during hover */
.rings-interacting.rings-interactive .ring-pulse {
  animation-play-state: paused;
}
```

Remove the existing `.rings-interacting .ring-pulse` rule (now replaced above).

- [ ] **Step 2: Verify CSS parses without errors**

Run `pnpm dev` and check browser console — no CSS errors expected.

### Task 2: Add VizPhase state machine to App.tsx

**Files:**
- Modify: `src/App.tsx`

**Context:**
- `vizPhase` starts as `'loading'`, becomes `'revealing'` when layout arrives, then `'interactive'` after ~2400ms.
- All interaction handlers are gated: no hover/click during `revealing`.

- [ ] **Step 1: Add vizPhase state and transition logic**

```tsx
type VizPhase = 'loading' | 'revealing' | 'interactive'

const [vizPhase, setVizPhase] = useState<VizPhase>('loading')
const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

// Transition to 'revealing' when layout first arrives
useEffect(() => {
  if (layout && vizPhase === 'loading') {
    setVizPhase('revealing')
    phaseTimerRef.current = setTimeout(() => {
      setVizPhase('interactive')
    }, 2400)
  }
  return () => {
    if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current)
  }
}, [layout, vizPhase])
```

- [ ] **Step 2: Gate all interaction handlers on vizPhase**

Wrap `setHoveredStationIndex`, `setHoveredRingIndex`, and `handleStationSelect` so they are no-ops during `revealing`:

```tsx
const handleStationEnter = useCallback((index: number) => {
  if (vizPhase !== 'interactive') return
  setHoveredStationIndex(index)
}, [vizPhase])

const handleRingEnter = useCallback((index: number) => {
  if (vizPhase !== 'interactive') return
  setHoveredRingIndex(index)
}, [vizPhase])
```

- [ ] **Step 3: Pass vizPhase to RadialViz**

Add `vizPhase={vizPhase}` to `<RadialViz>` props. Sidebar does not need vizPhase.

### Task 3: Update ServiceRings — ring-reveal animation + vizPhase

**Files:**
- Modify: `src/components/ServiceRings.tsx`

- [ ] **Step 1: Add vizPhase prop to interface**

```tsx
interface ServiceRingsProps {
  // ... existing props ...
  vizPhase: VizPhase
}
```

Import `VizPhase` type from App or define it in a shared types file — for simplicity, re-define locally in this file:
```tsx
type VizPhase = 'loading' | 'revealing' | 'interactive'
```

- [ ] **Step 2: Use ring-reveal class during revealing, normal class during interactive**

Remove `className="station-entry"` from station `<g>`. For each arc `<path>`:

```tsx
const RING_STAGGER_MS = 120
const revealDelay = ringIndex * RING_STAGGER_MS

const arcClassName = vizPhase === 'revealing'
  ? 'arc-path ring-reveal'
  : 'arc-path ring-pulse'

return (
  <path
    key={`${station.stationIndex}-${ringIndex}`}
    className={arcClassName}
    style={
      vizPhase === 'revealing'
        ? { animationDelay: `${revealDelay}ms` }
        : { animationDelay: `${ringIndex * 320}ms` }  // existing pulse stagger
    }
    // ... rest unchanged
  />
)
```

- [ ] **Step 3: Add rings-interactive class to the outer `<g>` once interactive**

```tsx
<g
  transform={`translate(${cx},${cy})`}
  className={[
    isInteracting ? 'rings-interacting' : '',
    vizPhase === 'interactive' ? 'rings-interactive' : '',
  ].filter(Boolean).join(' ')}
>
```

- [ ] **Step 4: Disable mouse handlers during revealing**

```tsx
onMouseEnter={vizPhase === 'interactive' ? () => onStationEnter(station.stationIndex) : undefined}
onMouseLeave={vizPhase === 'interactive' ? onStationLeave : undefined}
cursor={vizPhase === 'interactive' ? 'pointer' : 'default'}
```

### Task 4: Update StationLabels — deferred label reveal

**Files:**
- Modify: `src/components/StationLabels.tsx`

- [ ] **Step 1: Add vizPhase prop**

```tsx
interface StationLabelsProps {
  // ... existing ...
  vizPhase: VizPhase
}
type VizPhase = 'loading' | 'revealing' | 'interactive'
```

- [ ] **Step 2: Replace station-entry with station-label-entry, shift base delay**

The new animation starts at 1800ms base + angular stagger (0–600ms):

```tsx
// Remove className="station-entry" from the <g>
// Move animation to the text/line elements, using new class

const LABEL_BASE_MS = 1800
const entryDelay = Math.max(0, ((station.midAngle + Math.PI / 2) / (2 * Math.PI)) * 600) + LABEL_BASE_MS
```

During `revealing`: render labels with `className="station-label-entry"` and the delay.
During `interactive`: render labels with no animation class (normal opacity from interaction state).

```tsx
const labelAnimProps = vizPhase === 'revealing'
  ? { className: 'station-label-entry', style: { animationDelay: `${entryDelay}ms`, ...existingStyle } }
  : { style: existingStyle }
```

Apply `labelAnimProps` to the `<text>` element. The `<line>` connector can also use the same class.

- [ ] **Step 3: Disable mouse handlers during revealing**

Same as ServiceRings: gate `onMouseEnter`/`onMouseLeave` on `vizPhase === 'interactive'`.

- [ ] **Step 4: Verify in browser**

Reload page. Expected sequence:
1. 0ms: all arcs opacity 0
2. 0–400ms: S-Bahn ring fades in across all stations
3. 120ms–520ms: U-Bahn ring fades in
4. ... cascades through 11 rings ...
5. ~1600ms: all arcs visible
6. 1800ms–2400ms: station labels fade in by angular position
7. 2400ms: pulse animation starts, hover/click enabled

- [ ] **Step 5: Commit**

```bash
git add src/index.css src/components/ServiceRings.tsx src/components/StationLabels.tsx src/App.tsx
git commit -m "feat: ring-by-ring reveal with VizPhase state machine"
```

---

## Chunk 2: Click-to-select with center detail

### Task 5: Add selectedStationIndex + click/Esc handling to App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add selectedStationIndex state**

```tsx
const [selectedStationIndex, setSelectedStationIndex] = useState<number | null>(null)

const handleStationSelect = useCallback((index: number) => {
  if (vizPhase !== 'interactive') return
  setSelectedStationIndex((prev) => prev === index ? null : index) // toggle
}, [vizPhase])

const handleDeselect = useCallback(() => {
  setSelectedStationIndex(null)
}, [])
```

- [ ] **Step 2: Add Esc key handler**

```tsx
useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') setSelectedStationIndex(null)
  }
  window.addEventListener('keydown', onKey)
  return () => window.removeEventListener('keydown', onKey)
}, [])
```

- [ ] **Step 3: Derive selectedStation and hoveredStationName**

```tsx
const selectedStation: StationGeometry | null =
  selectedStationIndex !== null && layout
    ? (layout.stations.find((s) => s.stationIndex === selectedStationIndex) ?? null)
    : null

const hoveredStationName: string | null =
  hoveredStationIndex !== null && layout
    ? (layout.stations.find((s) => s.stationIndex === hoveredStationIndex)?.name ?? null)
    : null
```

- [ ] **Step 4: Derive isIdle and searchMatchCount**

```tsx
const isIdle =
  vizPhase === 'interactive' &&
  selectedStationIndex === null &&
  hoveredStationIndex === null &&
  hoveredRingIndex === null &&
  searchQuery === ''

const searchMatchCount = activeStationIndices.size
```

- [ ] **Step 5: Pass all new props to RadialViz**

```tsx
<RadialViz
  // ... existing ...
  vizPhase={vizPhase}
  selectedStationIndex={selectedStationIndex}
  selectedStation={selectedStation}
  hoveredStationName={hoveredStationName}
  isIdle={isIdle}
  insights={insights}             // added in Chunk 3
  searchMatchCount={searchMatchCount}
  onStationSelect={handleStationSelect}
  onDeselect={handleDeselect}
/>
```

### Task 6: Update RadialViz — thread new props

**Files:**
- Modify: `src/components/RadialViz.tsx`

- [ ] **Step 1: Extend RadialVizProps interface**

```tsx
interface RadialVizProps {
  // ... existing ...
  vizPhase: VizPhase
  selectedStationIndex?: number | null
  selectedStation?: StationGeometry | null
  hoveredStationName?: string | null
  isIdle?: boolean
  insights?: string[]
  searchMatchCount?: number
  onStationSelect?: (index: number) => void
  onDeselect?: () => void
}
type VizPhase = 'loading' | 'revealing' | 'interactive'
```

- [ ] **Step 2: Add onClick on `<svg>` for background deselect**

```tsx
<svg
  width={width}
  height={height}
  style={{ display: 'block', background: 'var(--viz-bg)' }}
  onClick={onDeselect}
>
```

- [ ] **Step 3: Pass new props to sub-components**

```tsx
// ServiceRings
<ServiceRings
  // ... existing ...
  vizPhase={vizPhase}
  selectedStationIndex={selectedStationIndex ?? null}
  onStationSelect={onStationSelect}
/>

// StationLabels
<StationLabels
  // ... existing ...
  vizPhase={vizPhase}
  selectedStationIndex={selectedStationIndex ?? null}
/>

// CenterLabel
<CenterLabel
  cx={cx}
  cy={cy}
  r={layout.centerR}
  hoveredRingLabel={hoveredRingLabel}
  hoveredStationName={hoveredStationName ?? null}
  selectedStation={selectedStation ?? null}
  isIdle={isIdle ?? false}
  insights={insights ?? []}
  searchMatchCount={searchMatchCount ?? 0}
/>
```

### Task 7: Update ServiceRings — click handler + selected opacity

**Files:**
- Modify: `src/components/ServiceRings.tsx`

- [ ] **Step 1: Add selectedStationIndex and onStationSelect props**

```tsx
interface ServiceRingsProps {
  // ... existing ...
  selectedStationIndex: number | null
  onStationSelect?: (index: number) => void
}
```

- [ ] **Step 2: Update opacity logic — selected takes highest priority**

```tsx
const isSelected = selectedStationIndex !== null
const isThisSelected = station.stationIndex === selectedStationIndex

let stationOpacity: number
if (isSelected) {
  stationOpacity = isThisSelected ? 1 : 0.15   // spec: 0.15 for context visibility
} else if (isStationHover) {
  stationOpacity = station.stationIndex === hoveredStationIndex ? 1 : 0.08
} else if (isRingHover) {
  stationOpacity = 1
} else if (isSearchActive) {
  stationOpacity = activeStationIndices.has(station.stationIndex) ? 1 : 0.08
} else {
  stationOpacity = 0.85
}
```

- [ ] **Step 3: White stroke on selected station's arcs**

```tsx
const stroke =
  (isSelected && isThisSelected && hasService) ||
  (isStationHover && station.stationIndex === hoveredStationIndex && hasService)
    ? 'var(--viz-stroke-hover)'
    : 'none'
```

- [ ] **Step 4: Add onClick with stopPropagation**

```tsx
onClick={vizPhase === 'interactive' ? (e) => {
  e.stopPropagation()
  onStationSelect?.(station.stationIndex)
} : undefined}
```

### Task 8: Update StationLabels — selected opacity

**Files:**
- Modify: `src/components/StationLabels.tsx`

- [ ] **Step 1: Add selectedStationIndex prop**

```tsx
interface StationLabelsProps {
  // ... existing ...
  selectedStationIndex: number | null
}
```

- [ ] **Step 2: Update fill/opacity logic — selected takes priority**

```tsx
const isSelected = selectedStationIndex !== null
const isThisSelected = station.stationIndex === selectedStationIndex

if (isSelected) {
  opacity = isThisSelected ? 1 : 0.08
  fill = isThisSelected ? 'var(--viz-text-primary)' : 'var(--viz-text-dimmed)'
} else if (hoveredStationIndex !== null) {
  opacity = isHovered ? 1 : 0.2
  fill = isHovered ? 'var(--viz-text-primary)' : 'var(--viz-text-dimmed)'
} else if (isRingHover) {
  opacity = 0.3
  fill = 'var(--viz-text-dimmed)'
} else if (isSearchActive) {
  const isMatch = activeStationIndices.has(station.stationIndex)
  opacity = isMatch ? 1 : 0.08
  fill = isMatch ? 'var(--viz-text-primary)' : 'var(--viz-text-dimmed)'
} else {
  opacity = 1
  fill = 'var(--viz-text-dimmed)'
}
```

### Task 9: Rewrite CenterLabel for 6 display states

**Files:**
- Modify: `src/components/CenterLabel.tsx`

**Context — Priority order (highest first):**
1. `selectedStation !== null` → station detail (name + "X von 11 Diensten" + 11 service dots)
2. `hoveredStationName !== null` → station name centered (single line)
3. `hoveredRingLabel !== null` → service name (existing behavior)
4. `searchMatchCount > 0` → "X Treffer"
5. `isIdle === false` (viz is revealing) → static title "MÜNCHEN / Mobilitätspunkte"
6. `isIdle === true` → cycling insights

- [ ] **Step 1: Update CenterLabelProps interface**

```tsx
import { SERVICE_DEFINITIONS } from '../lib/colors'
import type { StationGeometry } from '../lib/layout'

interface CenterLabelProps {
  cx: number
  cy: number
  r: number
  hoveredRingLabel: string | null
  hoveredStationName: string | null
  selectedStation: StationGeometry | null
  isIdle: boolean
  insights: string[]
  searchMatchCount: number
}
```

- [ ] **Step 2: Add insight cycling state**

```tsx
const [insightIndex, setInsightIndex] = useState(0)
const [insightVisible, setInsightVisible] = useState(true)
const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

// Start cycling when idle; stop and schedule 5s resume when interaction begins
useEffect(() => {
  if (!isIdle || insights.length === 0) {
    // Interaction started — stop cycle, schedule resume after 5s
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    return
  }

  // isIdle just became true — wait 5s then start cycling
  resumeTimerRef.current = setTimeout(() => {
    intervalRef.current = setInterval(() => {
      setInsightVisible(false)
      setTimeout(() => {
        setInsightIndex((i) => (i + 1) % insights.length)
        setInsightVisible(true)
      }, 200)
    }, 4000)
  }, 5000)

  return () => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)
  }
}, [isIdle, insights])
```

- [ ] **Step 3: Compute active state for each priority level**

```tsx
const showSelected = selectedStation !== null
const showHoveredStation = !showSelected && hoveredStationName !== null
const showRingLabel = !showSelected && !showHoveredStation && hoveredRingLabel !== null
const showSearchCount = !showSelected && !showHoveredStation && !showRingLabel && searchMatchCount > 0
const showTitle = !isIdle && !showSelected && !showHoveredStation && !showRingLabel && !showSearchCount
const showInsights = isIdle && !showSelected && !showHoveredStation && !showRingLabel && !showSearchCount

const activeServices = selectedStation
  ? SERVICE_DEFINITIONS.filter((svc) => selectedStation.services[svc.field] === true)
  : []
const serviceCount = activeServices.length

// Truncate station name at ~20 chars
const displayName = selectedStation
  ? (selectedStation.name.length > 20 ? selectedStation.name.slice(0, 19) + '…' : selectedStation.name)
  : ''
```

- [ ] **Step 4: Render all 6 states in JSX**

Keep the background circle. Replace the content groups:

```tsx
{/* 1. Selected station detail */}
<g style={{ opacity: showSelected ? 1 : 0, transition: 'opacity 150ms ease-out' }}>
  <text x={cx} y={cy - 14} textAnchor="middle" fontSize={7.5} fontWeight={600} fill="var(--viz-text-primary)">
    {displayName}
  </text>
  <text x={cx} y={cy - 4} textAnchor="middle" fontSize={6.5} fill="var(--viz-text-muted)">
    {serviceCount} von 11 Diensten
  </text>
  {/* All 11 service dots — present = colored, absent = dim */}
  {SERVICE_DEFINITIONS.map((svc, i) => {
    const present = selectedStation?.services[svc.field] === true
    const col = i % 6
    const row = Math.floor(i / 6)
    const dotSpacing = 8
    const totalCols = Math.min(6, SERVICE_DEFINITIONS.length)
    const startX = cx - (totalCols * dotSpacing) / 2 + dotSpacing / 2
    return (
      <circle
        key={svc.field}
        cx={startX + col * dotSpacing}
        cy={cy + 8 + row * 9}
        r={2.5}
        fill={present ? svc.color : 'var(--viz-separator)'}
        opacity={present ? 0.9 : 0.5}
      />
    )
  })}
</g>

{/* 2. Hovered station name */}
<g style={{ opacity: showHoveredStation ? 1 : 0, transition: 'opacity 150ms ease-out' }}>
  <text x={cx} y={cy + 4} textAnchor="middle" fontSize={9} fill="var(--viz-text-primary)">
    {hoveredStationName ?? ''}
  </text>
</g>

{/* 3. Ring hover label */}
<g style={{ opacity: showRingLabel ? 1 : 0, transition: 'opacity 150ms ease-out' }}>
  <text x={cx} y={cy + 4} textAnchor="middle" fontSize={9} fill="var(--viz-text-primary)">
    {hoveredRingLabel ?? ''}
  </text>
</g>

{/* 4. Search match count */}
<g style={{ opacity: showSearchCount ? 1 : 0, transition: 'opacity 150ms ease-out' }}>
  <text x={cx} y={cy + 4} textAnchor="middle" fontSize={8} fill="var(--viz-text-muted)">
    {searchMatchCount} Treffer
  </text>
</g>

{/* 5. Static title (during reveal and non-idle non-interaction) */}
<g style={{ opacity: showTitle ? 1 : 0, transition: 'opacity 150ms ease-out' }}>
  <text x={cx} y={cy - 8} textAnchor="middle" fontSize={7} fill="var(--viz-text-muted)" letterSpacing={1.5}>
    MÜNCHEN
  </text>
  <text x={cx} y={cy + 4} textAnchor="middle" fontSize={8.5} fill="var(--viz-text-primary)" fontWeight={600}>
    Mobilitäts-
  </text>
  <text x={cx} y={cy + 15} textAnchor="middle" fontSize={8.5} fill="var(--viz-text-primary)" fontWeight={600}>
    punkte
  </text>
</g>

{/* 6. Cycling insights */}
<g style={{ opacity: showInsights ? 1 : 0, transition: 'opacity 200ms ease-out' }}>
  <text
    x={cx}
    y={cy + 4}
    textAnchor="middle"
    fontSize={6.5}
    fill="var(--viz-text-muted)"
    letterSpacing={0.3}
    style={{ opacity: insightVisible ? 1 : 0, transition: 'opacity 200ms ease-out' }}
  >
    {insights[insightIndex] ?? ''}
  </text>
</g>
```

- [ ] **Step 5: Verify click-to-select in browser**

- Click a station arc → other stations dim to 0.15, center shows "X von 11 Diensten" + 11 dots
- Hover same station while selected → center still shows detail (selected > hovered)
- Hover a legend ring while selected → center shows ring name temporarily
- Click station again → deselects
- Click SVG background → deselects
- Esc → deselects
- Hovering a different (non-selected) station → center shows that station's name

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/components/RadialViz.tsx src/components/ServiceRings.tsx src/components/StationLabels.tsx src/components/CenterLabel.tsx
git commit -m "feat: click-to-select stations with center detail view"
```

---

## Chunk 3: Auto-rotating German insights

### Task 10: computeInsights utility

**Files:**
- Create: `src/lib/insights.ts`
- Create: `src/lib/__tests__/insights.test.ts`

**Context:**
- Takes `stations: StationGeometry[]` (not LayoutResult)
- Returns up to 6 German insight strings (insight #6 omitted if count is 0)
- German decimal formatting: comma separator (use `.replace('.', ',')`)
- Insight set (spec-defined):
  1. Total: `"137 Stationen · 11 Dienste"`
  2. Rarest service: `"Nur 5 Stationen mit On-demand Shuttle"` (dynamically find lowest count)
  3. Most common service: `"124 Stationen mit Bus-Anbindung"` (dynamically find highest count)
  4. Best-connected group: `"S-Bahn-Stationen: ∅ 8,2 Dienste"` (group with highest avg service count, using `GROUP_LABELS`)
  5. Micro-mobility: `"23 Stationen mit Bikesharing + Leihscooter + Mietrad"`
  6. Full service (conditional): `"4 Stationen mit allen 11 Diensten"` (omit if count === 0)

- [ ] **Step 1: Write the failing test**

Create `src/lib/__tests__/insights.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { computeInsights } from '../insights'
import type { StationGeometry } from '../layout'

const makeStation = (
  index: number,
  name: string,
  groupKey: 's-bahn' | 'u-bahn' | 'tram' | 'bus' | 'none',
  services: Partial<Record<string, boolean>>
): StationGeometry => ({
  stationIndex: index,
  name,
  groupKey,
  adresse: '',
  anzStellplCs: 0,
  startAngle: 0, endAngle: 1, fillStartAngle: 0, fillEndAngle: 1,
  midAngle: 0.5, labelFlip: false, labelAnchor: 'start',
  services: {
    's_bahn_vorhanden': false, 'u_bahn_vorhanden': false, 'tram_vorhanden': false,
    'bus_vorhanden': false, 'ods_vorhanden': false, 'gaf_ts_vorhanden': false,
    'gaf_bs_vorhanden': false, 'gaf_ls_vorhanden': false, 'gaf_ms_vorhanden': false,
    'radservicestation_vorhanden': false, 'radpumpe_vorhanden': false,
    ...services,
  },
})

const stations: StationGeometry[] = [
  makeStation(0, 'Hauptbahnhof', 's-bahn', {
    's_bahn_vorhanden': true, 'bus_vorhanden': true, 'gaf_ts_vorhanden': true,
    'gaf_bs_vorhanden': true, 'gaf_ls_vorhanden': true, 'gaf_ms_vorhanden': true,
  }),
  makeStation(1, 'Marienplatz', 'u-bahn', {
    'u_bahn_vorhanden': true, 'bus_vorhanden': true,
  }),
  makeStation(2, 'Isartor', 'bus', {
    'bus_vorhanden': true,
  }),
]

describe('computeInsights', () => {
  it('returns between 5 and 6 strings', () => {
    const insights = computeInsights(stations)
    expect(insights.length).toBeGreaterThanOrEqual(5)
    expect(insights.length).toBeLessThanOrEqual(6)
  })

  it('insight 0 shows total station count', () => {
    const insights = computeInsights(stations)
    expect(insights[0]).toBe('3 Stationen · 11 Dienste')
  })

  it('insight 1 shows rarest service dynamically', () => {
    const insights = computeInsights(stations)
    // Many services have count 0, so the rarest is among those
    expect(insights[1]).toMatch(/Nur \d+ Stationen? mit /)
  })

  it('insight 2 shows most common service', () => {
    const insights = computeInsights(stations)
    // Bus has count 3 (all stations) — most common
    expect(insights[2]).toMatch(/3 Stationen mit Bus/)
  })

  it('insight 3 uses German decimal comma', () => {
    const insights = computeInsights(stations)
    // Should not contain a period as decimal separator
    expect(insights[3]).not.toMatch(/\d\.\d/)
  })

  it('insight 4 counts micro-mobility stations', () => {
    const insights = computeInsights(stations)
    // Only Hauptbahnhof has all three micro services
    expect(insights[4]).toContain('1 ')
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

```bash
pnpm test src/lib/__tests__/insights.test.ts
```
Expected: FAIL — `computeInsights` not found.

- [ ] **Step 3: Create `src/lib/insights.ts`**

```ts
import { SERVICE_DEFINITIONS, GROUP_LABELS } from './colors'
import type { StationGeometry } from './layout'
import type { GroupKey } from './colors'

function toGermanDecimal(num: number, digits = 1): string {
  return num.toFixed(digits).replace('.', ',')
}

function countService(stations: StationGeometry[], field: string): number {
  return stations.filter((s) => s.services[field] === true).length
}

export function computeInsights(stations: StationGeometry[]): string[] {
  const total = stations.length
  const insights: string[] = []

  // 1. Total
  insights.push(`${total} Stationen · 11 Dienste`)

  // 2. Rarest service (lowest count, > 0 preferred; if all are 0 use first)
  const serviceCounts = SERVICE_DEFINITIONS.map((svc) => ({
    label: svc.label,
    count: countService(stations, svc.field),
  }))
  const rarest = serviceCounts.reduce((min, cur) =>
    cur.count < min.count ? cur : min
  , serviceCounts[0])
  insights.push(`Nur ${rarest.count} ${rarest.count === 1 ? 'Station' : 'Stationen'} mit ${rarest.label}`)

  // 3. Most common service
  const mostCommon = serviceCounts.reduce((max, cur) =>
    cur.count > max.count ? cur : max
  , serviceCounts[0])
  insights.push(`${mostCommon.count} Stationen mit ${mostCommon.label}`)

  // 4. Best-connected group (highest avg service count)
  const groupKeys: GroupKey[] = ['s-bahn', 'u-bahn', 'tram', 'bus', 'none']
  const groupStats = groupKeys
    .map((key) => {
      const groupStations = stations.filter((s) => s.groupKey === key)
      if (groupStations.length === 0) return null
      const avg = groupStations.reduce(
        (sum, s) => sum + Object.values(s.services).filter(Boolean).length, 0
      ) / groupStations.length
      return { key, avg }
    })
    .filter((g): g is { key: GroupKey; avg: number } => g !== null)

  if (groupStats.length > 0) {
    const best = groupStats.reduce((max, cur) => cur.avg > max.avg ? cur : max, groupStats[0])
    insights.push(`${GROUP_LABELS[best.key]}-Stationen: ∅ ${toGermanDecimal(best.avg)} Dienste`)
  }

  // 5. Micro-mobility: Bikesharing + Leihscooter + Mietrad
  const microFields = ['gaf_bs_vorhanden', 'gaf_ls_vorhanden', 'gaf_ms_vorhanden']
  const microCount = stations.filter((s) => microFields.every((f) => s.services[f] === true)).length
  insights.push(`${microCount} ${microCount === 1 ? 'Station' : 'Stationen'} mit Bikesharing + Leihscooter + Mietrad`)

  // 6. Full service (all 11 services — omit if 0)
  const allFields = SERVICE_DEFINITIONS.map((svc) => svc.field)
  const fullCount = stations.filter((s) => allFields.every((f) => s.services[f] === true)).length
  if (fullCount > 0) {
    insights.push(`${fullCount} ${fullCount === 1 ? 'Station' : 'Stationen'} mit allen 11 Diensten`)
  }

  return insights
}
```

- [ ] **Step 4: Run tests to confirm pass**

```bash
pnpm test src/lib/__tests__/insights.test.ts
```
Expected: 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/insights.ts src/lib/__tests__/insights.test.ts
git commit -m "feat: add computeInsights utility with 6 German insight strings"
```

### Task 11: Wire insights into App and CenterLabel

**Files:**
- Modify: `src/App.tsx`
- (CenterLabel already has cycling logic from Task 9)

- [ ] **Step 1: Import computeInsights and wire into App.tsx**

```tsx
import { computeInsights } from './lib/insights'

const insights = useMemo(() => {
  if (!layout) return []
  return computeInsights(layout.stations)
}, [layout])
```

Pass `insights={insights}` to `<RadialViz>` (already in the props from Task 6).

- [ ] **Step 2: Run all tests**

```bash
pnpm test
```
Expected: all tests pass (existing tests + 6 new insight tests).

> **Note:** Tooltip-on-select (fixed position tooltip on click) is out of scope for this plan. The spec describes it but it can be implemented as a follow-up. The current tooltip still appears on hover.

- [ ] **Step 3: Verify full flow in browser**

- Load page → ring-by-ring reveal plays
- After 2400ms → insights start cycling every 4s with crossfade in center
- Hover station → center shows station name
- Click station → center shows detail (name + "X von 11 Diensten" + dots)
- Hover legend ring while station selected → center shows ring name, reverts to detail on leave
- Open search, type → center shows "X Treffer"
- Clear search → insights resume from next insight (not reset to 0)

- [ ] **Step 4: Commit and push**

```bash
git add src/App.tsx
git commit -m "feat: wire insights into center cycling with 5s resume timer"
git push origin main
```

---

## Summary of files changed

| File | Change |
|------|--------|
| `src/index.css` | Replace `station-fade-in`/`.station-entry` with `ring-reveal`/`.ring-reveal`; add `.station-label-entry`; gate `ring-pulse` on `.rings-interactive` |
| `src/App.tsx` | Add `VizPhase` state machine; `selectedStationIndex`; `isIdle`; `searchMatchCount`; `hoveredStationName`; `insights` via `useMemo` |
| `src/components/RadialViz.tsx` | Thread all new props; add `onClick` on `<svg>` |
| `src/components/ServiceRings.tsx` | Ring-reveal animation; `VizPhase` gating; click handler; selected opacity (0.15) |
| `src/components/StationLabels.tsx` | Deferred label reveal (1800ms base); selected opacity |
| `src/components/CenterLabel.tsx` | 6-state display; insight cycling with 4s interval; `hoveredStationName`; `searchMatchCount`; 11-dot service display |
| `src/lib/insights.ts` | **New** — `computeInsights(stations)` |
| `src/lib/__tests__/insights.test.ts` | **New** — 6 tests |
