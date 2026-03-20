# Sidebar + Station Search Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Relocate the legend to a right sidebar (220px) and add a two-phase station search bar with Levenshtein-based "Meinst du?" suggestions.

**Architecture:** New `Sidebar` and `SearchBar` components replace the bottom `<Legend>` strip. Search state (`searchQuery`, `activeStationIndices`) lives in `App` and flows down through `RadialViz` to `ServiceRings` and `StationLabels` via a new `activeStationIndices: Set<number>` prop. The existing opacity priority ladder gains a Priority 3 search branch between ring-hover and default.

**Tech Stack:** React 18, TypeScript strict, Vite 5, no new npm packages. Tests with Vitest + @testing-library/react (jsdom). Worktree: `~/.config/superpowers/worktrees/mobilitaetspunkte-viz/build`, branch `build/radial-viz`.

---

## Chunk 1: Pure lib + Legend layout

### Task 0: Levenshtein lib + tests

**Files:**
- Create: `src/lib/levenshtein.ts`
- Create: `src/lib/__tests__/levenshtein.test.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/lib/__tests__/levenshtein.test.ts
import { describe, it, expect } from 'vitest'
import { levenshtein } from '../levenshtein'

describe('levenshtein', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshtein('freiheit', 'freiheit')).toBe(0)
  })
  it('returns string length when other is empty', () => {
    expect(levenshtein('abc', '')).toBe(3)
    expect(levenshtein('', 'abc')).toBe(3)
  })
  it('counts single substitution', () => {
    expect(levenshtein('kitten', 'sitten')).toBe(1)
  })
  it('counts substitution + insertion', () => {
    // "fryhait"→"freiheit": DP yields 3 (y→e, h→i, a→h = 3 subs + 1 insert optimally = 3)
    expect(levenshtein('fryhait', 'freiheit')).toBe(3)
  })
  it('is case-sensitive (callers lowercase before calling)', () => {
    expect(levenshtein('A', 'a')).toBe(1)
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL (module not found)**

```bash
cd ~/.config/superpowers/worktrees/mobilitaetspunkte-viz/build
pnpm test -- levenshtein
```

Expected: `Cannot find module '../levenshtein'`

- [ ] **Step 3: Implement**

```ts
// src/lib/levenshtein.ts
export function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
      }
    }
  }
  return dp[m][n]
}
```

- [ ] **Step 4: Run tests — expect all 5 PASS**

```bash
pnpm test -- levenshtein
```

- [ ] **Step 5: Commit**

```bash
git add src/lib/levenshtein.ts src/lib/__tests__/levenshtein.test.ts
git commit -m "feat: add levenshtein distance lib + tests"
```

---

### Task 1: Legend — vertical layout

**Files:**
- Modify: `src/components/Legend.tsx`

Legend currently has a horizontal wrapping inner `<div>` and a "SERVICE RINGS" label. Both change here.

- [ ] **Step 1: Update Legend.tsx**

Replace the entire file content. Note: `fontSize` on labels is bumped from 11→12 and inner row `gap` from 4→6 — minor sidebar readability improvements, not spec deviations.

```tsx
// src/components/Legend.tsx
import { SERVICE_DEFINITIONS } from '../lib/colors'

interface LegendProps {
  hoveredRingIndex: number | null
  isStationHover: boolean
  onRingEnter: (index: number) => void
  onRingLeave: () => void
}

export function Legend({
  hoveredRingIndex,
  isStationHover,
  onRingEnter,
  onRingLeave,
}: LegendProps) {
  const isRingHover = hoveredRingIndex !== null
  const containerOpacity = isRingHover || isStationHover ? 1 : 0.5

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        gap: 4,
        padding: 0,
        opacity: containerOpacity,
        transition: 'opacity 150ms ease-out',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      {/* Items list — vertical */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SERVICE_DEFINITIONS.map((svc, i) => {
          const isHovered = hoveredRingIndex === i
          const labelColor = isHovered
            ? '#c9d8e8'
            : isRingHover
            ? 'rgba(138, 180, 212, 0.4)'
            : '#8ab4d4'

          return (
            <div
              key={svc.field}
              style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
              onMouseEnter={() => onRingEnter(i)}
              onMouseLeave={onRingLeave}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: svc.color,
                  flexShrink: 0,
                  opacity: isRingHover && !isHovered ? 0.4 : 1,
                  transition: 'opacity 150ms ease-out',
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  color: labelColor,
                  transition: 'color 150ms ease-out',
                  userSelect: 'none',
                }}
              >
                {svc.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Build to verify no TS errors**

```bash
cd ~/.config/superpowers/worktrees/mobilitaetspunkte-viz/build
pnpm build 2>&1 | tail -20
```

Expected: build succeeds (may warn about unused Legend import in App — ignore for now, App changes in Task 4).

- [ ] **Step 3: Commit**

```bash
git add src/components/Legend.tsx
git commit -m "feat: legend vertical layout for sidebar"
```

---

## Chunk 2: SearchBar + Sidebar

### Task 2: SearchBar component

**Files:**
- Create: `src/components/SearchBar.tsx`

`SearchBar` does two-phase search: substring match first, then word-tokenized Levenshtein fallback for zero results.

- [ ] **Step 1: Create SearchBar.tsx**

All `useState` declarations come first; functions and handlers follow. This ensures `setSuggestions` is in scope when `handleChange` calls `runSearch`.

```tsx
// src/components/SearchBar.tsx
import { useState, useEffect } from 'react'
import { levenshtein } from '../lib/levenshtein'
import type { StationGeometry } from '../lib/layout'

interface SearchBarProps {
  stations: StationGeometry[]
  searchQuery: string
  onSearch: (query: string, matchingIndices: Set<number>) => void
}

// Score = min levenshtein distance between query and any word token of the station name.
// Tokens split on spaces and hyphens. Handles e.g. "Fryhait" → "Freiheit" correctly.
function stationScore(query: string, name: string): number {
  const tokens = name.toLowerCase().split(/[\s-]+/).filter(Boolean)
  if (tokens.length === 0) return Infinity
  return Math.min(...tokens.map((t) => levenshtein(query.toLowerCase(), t)))
}

export function SearchBar({ stations, searchQuery, onSearch }: SearchBarProps) {
  // All state declared first — ensures setters are in scope for all handlers below
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<StationGeometry[]>([])

  // Sync input when searchQuery changes externally (suggestion click path).
  // Guard prevents echo: when user types, onSearch → App sets searchQuery to the same
  // string → this effect fires but searchQuery === inputValue so nothing happens.
  // Only the suggestion-click path changes searchQuery to a different value.
  useEffect(() => {
    if (searchQuery !== inputValue) {
      setInputValue(searchQuery)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  // Clear suggestions when input returns to a state with substring matches
  useEffect(() => {
    if (inputValue === '') {
      setSuggestions([])
      return
    }
    const q = inputValue.toLowerCase()
    const hasSubstring = stations.some((s) => s.name.toLowerCase().includes(q))
    if (hasSubstring || inputValue.length < 3) {
      setSuggestions([])
    }
  }, [inputValue, stations])

  const runSearch = (query: string) => {
    if (query === '') {
      onSearch('', new Set())
      setSuggestions([])
      return
    }
    // Phase 1: substring match
    const q = query.toLowerCase()
    const matches = stations.filter((s) => s.name.toLowerCase().includes(q))
    if (matches.length > 0) {
      onSearch(query, new Set(matches.map((s) => s.stationIndex)))
      return
    }
    // Phase 2: fuzzy Levenshtein fallback (query.length >= 3 only)
    if (query.length < 3) {
      onSearch(query, new Set())
      return
    }
    const scored = stations.map((s) => ({ s, score: stationScore(query, s.name) }))
    const minScore = Math.min(...scored.map((x) => x.score))
    const topMatches = scored
      .filter((x) => x.score === minScore)
      .map((x) => x.s)
      .sort((a, b) => a.name.localeCompare(b.name, 'de'))
      .slice(0, 2)
    onSearch(query, new Set()) // no highlight yet — suggestion click triggers highlight
    setSuggestions(topMatches)
  }

  const handleChange = (value: string) => {
    setInputValue(value)
    runSearch(value)
  }

  const handleClear = () => {
    setInputValue('')
    setSuggestions([])
    onSearch('', new Set())
  }

  const handleSuggestionClick = (station: StationGeometry) => {
    // Do NOT call setInputValue — guarded useEffect syncs it from searchQuery
    onSearch(station.name, new Set([station.stationIndex]))
  }

  return (
    <div style={{ width: '100%' }}>
      {/* Input row */}
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Station suchen…"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 0,
            color: '#c9d8e8',
            fontSize: 13,
            padding: '7px 28px 7px 10px',
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            outline: 'none',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.25)' }}
          onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.12)' }}
        />
        {inputValue && (
          <button
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'rgba(138,180,212,0.6)',
              cursor: 'pointer',
              fontSize: 14,
              padding: 0,
              lineHeight: 1,
            }}
            aria-label="Suche löschen"
          >
            ×
          </button>
        )}
      </div>

      {/* Fuzzy suggestions */}
      {suggestions.length > 0 && (
        <div
          style={{
            marginTop: 6,
            fontSize: 11,
            color: 'rgba(138,180,212,0.7)',
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          }}
        >
          {suggestions.map((station) => (
            <div key={station.stationIndex} style={{ marginBottom: 3 }}>
              Meinst du:{' '}
              <span
                onClick={() => handleSuggestionClick(station)}
                style={{
                  color: '#c9d8e8',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textDecorationColor: 'rgba(201,216,232,0.4)',
                }}
              >
                {station.name}
              </span>
              ?
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Build to verify TS compiles**

```bash
pnpm build 2>&1 | tail -20
```

Expected: build succeeds. SearchBar is not yet imported anywhere — that's fine.

- [ ] **Step 3: Commit**

```bash
git add src/components/SearchBar.tsx
git commit -m "feat: add SearchBar with two-phase search and fuzzy suggestion"
```

---

### Task 3: Sidebar component

**Files:**
- Create: `src/components/Sidebar.tsx`

- [ ] **Step 1: Create Sidebar.tsx**

```tsx
// src/components/Sidebar.tsx
import type { StationGeometry } from '../lib/layout'
import { SearchBar } from './SearchBar'
import { Legend } from './Legend'

interface SidebarProps {
  stations: StationGeometry[]
  searchQuery: string
  onSearch: (query: string, matchingIndices: Set<number>) => void
  hoveredRingIndex: number | null
  isStationHover: boolean
  onRingEnter: (index: number) => void
  onRingLeave: () => void
}

export function Sidebar({
  stations,
  searchQuery,
  onSearch,
  hoveredRingIndex,
  isStationHover,
  onRingEnter,
  onRingLeave,
}: SidebarProps) {
  return (
    <div
      style={{
        width: 220,
        flexShrink: 0,
        height: '100%',
        background: '#0a1220',
        borderLeft: '1px solid rgba(255,255,255,0.06)',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        boxSizing: 'border-box',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      {/* Search */}
      <SearchBar stations={stations} searchQuery={searchQuery} onSearch={onSearch} />

      {/* Divider */}
      <div
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          margin: '16px 0',
          flexShrink: 0,
        }}
      />

      {/* Service rings label */}
      <div
        style={{
          fontSize: 10,
          color: '#4a7fa8',
          letterSpacing: 1,
          marginBottom: 10,
          userSelect: 'none',
        }}
      >
        SERVICE RINGS (inner → outer)
      </div>

      {/* Legend */}
      <Legend
        hoveredRingIndex={hoveredRingIndex}
        isStationHover={isStationHover}
        onRingEnter={onRingEnter}
        onRingLeave={onRingLeave}
      />
    </div>
  )
}
```

- [ ] **Step 2: Build to verify**

```bash
pnpm build 2>&1 | tail -20
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Sidebar.tsx
git commit -m "feat: add Sidebar component wrapping SearchBar + Legend"
```

---

## Chunk 3: Opacity wiring + App

### Task 4: RadialViz — thread activeStationIndices

**Files:**
- Modify: `src/components/RadialViz.tsx`

- [ ] **Step 1: Add `activeStationIndices` to RadialVizProps and pass to children**

In `src/components/RadialViz.tsx`, make these changes:

1. Add to `RadialVizProps` interface (after `hoveredRingIndex`):
```ts
activeStationIndices: Set<number>
```

2. Update the full destructure block (preserving the `hoveredStationIndexProp` alias):
```ts
// Before:
export function RadialViz({
  layout,
  groups: _groups,
  width,
  height,
  hoveredRingIndex,
  hoveredStationIndex: hoveredStationIndexProp,
  onStationEnter,
  onStationLeave,
}: RadialVizProps) {

// After:
export function RadialViz({
  layout,
  groups: _groups,
  width,
  height,
  hoveredRingIndex,
  hoveredStationIndex: hoveredStationIndexProp,
  activeStationIndices,
  onStationEnter,
  onStationLeave,
}: RadialVizProps) {
```

3. Pass to `<ServiceRings>`:
```tsx
<ServiceRings
  layout={layout}
  cx={cx}
  cy={cy}
  hoveredStationIndex={hoveredStationIndex}
  hoveredRingIndex={hoveredRingIndex}
  activeStationIndices={activeStationIndices}
  onStationEnter={handleStationEnter}
  onStationLeave={handleStationLeave}
/>
```

4. Pass to `<StationLabels>`:
```tsx
<StationLabels
  layout={layout}
  cx={cx}
  cy={cy}
  hoveredStationIndex={hoveredStationIndex}
  isRingHover={hoveredRingIndex !== null}
  activeStationIndices={activeStationIndices}
  onStationEnter={handleStationEnter}
  onStationLeave={handleStationLeave}
/>
```

- [ ] **Step 2: Verify the edit looks correct (do not build yet — TS errors expected)**

The build will fail until Tasks 5 and 6 add the prop to ServiceRings and StationLabels. Do not commit yet — commit after Task 6 when all three files are updated and the build is clean.

---

### Task 5: ServiceRings — search opacity branch

**Files:**
- Modify: `src/components/ServiceRings.tsx`

- [ ] **Step 1: Add `activeStationIndices` prop and Priority 3 opacity branch**

In `src/components/ServiceRings.tsx`:

1. Add to `ServiceRingsProps` interface:
```ts
activeStationIndices: Set<number>
```

2. Add to destructured props:
```ts
activeStationIndices,
```

3. After `const isRingHover = hoveredRingIndex !== null`, add:
```ts
const isSearchActive = activeStationIndices.size > 0
```

4. Replace the outer `stationOpacity` assignment block. **Before:**
```ts
let stationOpacity: number
if (isStationHover) {
  stationOpacity = station.stationIndex === hoveredStationIndex ? 1 : 0.08
} else if (isRingHover) {
  stationOpacity = 1 // per-ring opacity handled per segment below
} else {
  stationOpacity = 0.85
}
```

**After:**
```ts
let stationOpacity: number
if (isStationHover) {
  stationOpacity = station.stationIndex === hoveredStationIndex ? 1 : 0.08
} else if (isRingHover) {
  stationOpacity = 1 // per-ring opacity handled per segment below
} else if (isSearchActive) {
  stationOpacity = activeStationIndices.has(station.stationIndex) ? 1 : 0.08
} else {
  stationOpacity = 0.85
}
```

No changes to the inner per-path `if (isRingHover)` block — `stationOpacity` flows into the inner `else { opacity = stationOpacity }` branch automatically.

- [ ] **Step 2: Build — errors should reduce (StationLabels still missing prop)**

```bash
pnpm build 2>&1 | grep "error"
```

Expected: only StationLabels error remains. Do not commit yet.

---

### Task 6: StationLabels — search opacity branch

**Files:**
- Modify: `src/components/StationLabels.tsx`

- [ ] **Step 1: Add `activeStationIndices` prop and Priority 3 branch**

In `src/components/StationLabels.tsx`:

1. Add to `StationLabelsProps` interface:
```ts
activeStationIndices: Set<number>
```

2. Add to destructured props:
```ts
activeStationIndices,
```

3. Add `isSearchActive` **above** the `.map()` call (before the `return`), matching the pattern in `ServiceRings` where `isSearchActive` is computed once outside the station loop:
```ts
const isSearchActive = activeStationIndices.size > 0
```

4. Replace the `let opacity: number; let fill: string; if (...)` block **inside the `.map()` callback**. **Before:**
```ts
let opacity: number
let fill: string
if (hoveredStationIndex !== null) {
  opacity = isHovered ? 1 : 0.2
  fill = isHovered ? '#c9d8e8' : '#6a94b0'
} else if (isRingHover) {
  opacity = 0.3
  fill = '#6a94b0'
} else {
  opacity = 1
  fill = '#6a94b0'
}
```

**After:**
```ts
let opacity: number
let fill: string
if (hoveredStationIndex !== null) {
  opacity = isHovered ? 1 : 0.2
  fill = isHovered ? '#c9d8e8' : '#6a94b0'
} else if (isRingHover) {
  opacity = 0.3
  fill = '#6a94b0'
} else if (isSearchActive) {
  const isMatch = activeStationIndices.has(station.stationIndex)
  opacity = isMatch ? 1 : 0.08
  fill = isMatch ? '#c9d8e8' : '#6a94b0'
} else {
  opacity = 1
  fill = '#6a94b0'
}
```

- [ ] **Step 2: Build — should now compile clean (all three files updated)**

```bash
pnpm build 2>&1 | tail -10
```

Expected: 0 errors, build succeeds.

- [ ] **Step 3: Run all tests**

```bash
pnpm test
```

Expected: all 33 existing tests + 5 new levenshtein tests = 38 pass.

- [ ] **Step 4: Commit all three opacity-wiring files together**

```bash
git add src/components/RadialViz.tsx src/components/ServiceRings.tsx src/components/StationLabels.tsx
git commit -m "feat: wire activeStationIndices through RadialViz, ServiceRings, StationLabels"
```

---

### Task 7: App — layout restructure + full wiring

**Files:**
- Modify: `src/App.tsx`

This is the final wiring step. App switches from column to row flex, removes `<Legend>`, adds `<Sidebar>`, and passes `activeStationIndices` to `<RadialViz>`.

- [ ] **Step 1: Update App.tsx**

Replace the full file:

```tsx
// src/App.tsx
import { useState, useCallback, useEffect, useRef } from 'react'
import { useRadialLayout } from './hooks/useRadialLayout'
import { RadialViz } from './components/RadialViz'
import { Sidebar } from './components/Sidebar'
import { Tooltip } from './components/Tooltip'
import type { StationGeometry } from './lib/layout'

export default function App() {
  const svgContainerRef = useRef<HTMLDivElement>(null)
  const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = svgContainerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        const { width, height } = entry.contentRect
        setSvgDimensions({ width, height })
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const { layout, groups, error } = useRadialLayout(svgDimensions.width, svgDimensions.height)

  // Hover state
  const [hoveredRingIndex, setHoveredRingIndex] = useState<number | null>(null)
  const [hoveredStationIndex, setHoveredStationIndex] = useState<number | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [activeStationIndices, setActiveStationIndices] = useState<Set<number>>(new Set())

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }, [])

  const handleRingLeave = useCallback(() => setHoveredRingIndex(null), [])
  const handleStationLeave = useCallback(() => setHoveredStationIndex(null), [])

  const handleSearch = useCallback((query: string, indices: Set<number>) => {
    setSearchQuery(query)
    setActiveStationIndices(indices)
  }, [])

  const hoveredStation: StationGeometry | null =
    hoveredStationIndex !== null && layout
      ? (layout.stations.find((s) => s.stationIndex === hoveredStationIndex) ?? null)
      : null

  if (error) {
    return (
      <div style={{ color: '#cc4444', padding: 32, fontFamily: 'monospace' }}>
        Error loading data: {error}
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        height: '100vh',
        background: '#0f1b2d',
      }}
      onMouseMove={handleMouseMove}
    >
      {/* SVG container — flex:1, full height */}
      <div ref={svgContainerRef} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {layout && svgDimensions.width > 0 && svgDimensions.height > 0 ? (
          <RadialViz
            layout={layout}
            groups={groups}
            width={svgDimensions.width}
            height={svgDimensions.height}
            hoveredRingIndex={hoveredRingIndex}
            hoveredStationIndex={hoveredStationIndex}
            activeStationIndices={activeStationIndices}
            onStationEnter={setHoveredStationIndex}
            onStationLeave={handleStationLeave}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#4a7fa8',
              fontSize: 14,
              fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            }}
          >
            Lade Daten…
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <Sidebar
        stations={layout ? layout.stations : []}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        hoveredRingIndex={hoveredRingIndex}
        isStationHover={hoveredStationIndex !== null}
        onRingEnter={setHoveredRingIndex}
        onRingLeave={handleRingLeave}
      />

      {/* Tooltip */}
      <Tooltip station={hoveredStation} mouseX={mousePos.x} mouseY={mousePos.y} />
    </div>
  )
}
```

- [ ] **Step 2: Build clean**

```bash
pnpm build 2>&1 | tail -10
```

Expected: 0 TS errors, bundle compiles.

- [ ] **Step 3: Run all tests**

```bash
pnpm test
```

Expected: 38 tests pass.

- [ ] **Step 4: Smoke test in browser**

```bash
pnpm dev
```

Open `http://localhost:5173`. Verify:
- [ ] Sidebar visible on right, 220px, dark background
- [ ] Legend items stacked vertically with dots
- [ ] Search input visible at top of sidebar
- [ ] Typing a station name (e.g. "Frei") highlights matching stations, dims others
- [ ] Typing "Fryhait" (no substring match) shows "Meinst du: Münchner Freiheit?"
- [ ] Clicking suggestion fills input and highlights that station
- [ ] × button clears search and restores all stations
- [ ] Ring hover still works (dims non-hovered rings)
- [ ] Station hover still shows tooltip

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: sidebar layout + search wiring in App"
```

---

### Task 8: Deploy

- [ ] **Step 1: Final build**

```bash
pnpm build
```

Expected: no errors, dist/ generated.

- [ ] **Step 2: Deploy to Vercel**

```bash
vercel --prod
```

- [ ] **Step 3: Verify live URL**

Open the deployed URL. Confirm search, sidebar, and legend all work in production.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: post-deploy cleanup" --allow-empty
```
