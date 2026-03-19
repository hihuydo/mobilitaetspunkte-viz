# Mobilitätspunkte Radial Visualization Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page radial visualization showing 116 Munich mobility hubs as labeled spokes with 11 concentric service-ring arcs, poster aesthetic by default and interactive on hover.

**Architecture:** Pure-function data/layout layer (`lib/`) feeds a `useMemo` hook that returns pre-computed geometry; React components receive geometry as props and render SVG declaratively. Hover state lives in `RadialViz` and flows down as props. No D3 DOM manipulation.

**Tech Stack:** Vite 5, React 18, TypeScript, D3 v7 (math only), papaparse, Vitest + @testing-library/react, Vercel (static deploy)

**Spec:** `docs/superpowers/specs/2026-03-19-radial-viz-design.md`

---

## Chunk 1: Project Scaffold + Data Layer

### Task 0: Scaffold the Vite + React + TypeScript project

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/App.css`
- Create: `vercel.json`
- Create: `.gitignore`

- [ ] **Step 1: Scaffold Vite project in existing directory**

The project directory already exists with `data/` and `docs/`. Run:
```bash
cd "/Users/huydo/Dropbox/HIHUYDO/01 Projekte/00 Vibe Coding/daten-visualisierung/munich/mobilitaetspunkte-viz"
pnpm create vite . --template react-ts
```
When prompted "Current directory is not empty. Remove existing files and continue?", choose **No** — then scaffold fails because files exist. Instead, do it manually (Steps 2–6).

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "mobilitaetspunkte-viz",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "d3": "^7.9.0",
    "papaparse": "^5.4.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.6",
    "@testing-library/react": "^16.0.0",
    "@types/d3": "^7.4.3",
    "@types/papaparse": "^5.3.14",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "jsdom": "^24.1.1",
    "typescript": "^5.5.3",
    "vite": "^5.3.4",
    "vitest": "^2.0.4"
  },
  "pnpm": {
    "onlyBuiltDependencies": ["esbuild"]
  }
}
```

- [ ] **Step 3: Create `vite.config.ts`**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
  },
})
```

- [ ] **Step 4: Create `tsconfig.json`**

```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.app.json" },
    { "path": "./tsconfig.node.json" }
  ]
}
```

- [ ] **Step 5: Create `tsconfig.app.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedSideEffectImports": false
  },
  "include": ["src"]
}
```

- [ ] **Step 6: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 7: Create `index.html`**

```html
<!doctype html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mobilitätspunkte München</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Create `src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

- [ ] **Step 9: Create `src/App.tsx` (placeholder)**

```tsx
export default function App() {
  return <div style={{ color: 'white', background: '#0f1b2d', height: '100vh' }}>Loading...</div>
}
```

- [ ] **Step 10: Create `src/App.css` (base reset)**

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body, #root {
  height: 100%;
  width: 100%;
  background: #0f1b2d;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  color: #c9d8e8;
  overflow: hidden;
}
```

- [ ] **Step 11: Create `src/test-setup.ts`**

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 12: Create `vercel.json`**

```json
{
  "framework": null,
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install"
}
```

- [ ] **Step 13: Create `.gitignore`**

```
node_modules
dist
.env
.env.local
```

- [ ] **Step 14: Install dependencies**

```bash
cd "/Users/huydo/Dropbox/HIHUYDO/01 Projekte/00 Vibe Coding/daten-visualisierung/munich/mobilitaetspunkte-viz"
pnpm install
```

Expected: packages installed, no errors. If `esbuild` or `@tailwindcss/oxide` warn about build scripts, run `pnpm approve-builds`.

- [ ] **Step 15: Verify dev server starts**

```bash
pnpm dev
```

Open `http://localhost:5173` — should show white "Loading..." text on dark background. Kill the server with Ctrl+C.

- [ ] **Step 16: Run empty test suite**

```bash
pnpm test
```

Expected: "No test files found" or 0 tests passed. No errors.

- [ ] **Step 17: Commit scaffold**

```bash
git add -A
git commit -m "feat: scaffold Vite + React + TypeScript project"
```

---

### Task 1: Color constants

**Files:**
- Create: `src/lib/colors.ts`
- Create: `src/lib/__tests__/colors.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/__tests__/colors.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { SERVICE_DEFINITIONS, GROUP_COLORS, ABSENT_COLOR, BG_COLOR } from '../colors'

describe('SERVICE_DEFINITIONS', () => {
  it('has exactly 11 entries', () => {
    expect(SERVICE_DEFINITIONS).toHaveLength(11)
  })

  it('maps gaf_ts_vorhanden to Carsharing at ring index 5 (0-based)', () => {
    expect(SERVICE_DEFINITIONS[5].field).toBe('gaf_ts_vorhanden')
    expect(SERVICE_DEFINITIONS[5].label).toBe('Carsharing')
    expect(SERVICE_DEFINITIONS[5].color).toBe('#E91E63')
  })

  it('first ring is S-Bahn', () => {
    expect(SERVICE_DEFINITIONS[0].field).toBe('s_bahn_vorhanden')
    expect(SERVICE_DEFINITIONS[0].color).toBe('#00A651')
  })

  it('last ring (index 10) is Bike Pump', () => {
    expect(SERVICE_DEFINITIONS[10].field).toBe('radpumpe_vorhanden')
    expect(SERVICE_DEFINITIONS[10].color).toBe('#B0BEC5')
  })

  it('each entry has field, label, color', () => {
    SERVICE_DEFINITIONS.forEach((def) => {
      expect(typeof def.field).toBe('string')
      expect(typeof def.label).toBe('string')
      expect(def.color).toMatch(/^#[0-9A-Fa-f]{6}$/)
    })
  })
})

describe('GROUP_COLORS', () => {
  it('has color for all 5 groups', () => {
    expect(GROUP_COLORS['s-bahn']).toBe('#00A651')
    expect(GROUP_COLORS['u-bahn']).toBe('#0072BC')
    expect(GROUP_COLORS['tram']).toBe('#CC0000')
    expect(GROUP_COLORS['bus']).toBe('#F7941D')
    expect(GROUP_COLORS['none']).toBe('#4a7fa8')
  })
})

describe('constants', () => {
  it('ABSENT_COLOR is the dark background filler', () => {
    expect(ABSENT_COLOR).toBe('#0a1220')
  })

  it('BG_COLOR is the page background', () => {
    expect(BG_COLOR).toBe('#0f1b2d')
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
pnpm test
```

Expected: FAIL — `Cannot find module '../colors'`

- [ ] **Step 3: Create `src/lib/colors.ts`**

```typescript
export interface ServiceDefinition {
  field: string
  label: string
  color: string
}

/** 11 service rings, inner (index 0) → outer (index 10) */
export const SERVICE_DEFINITIONS: ServiceDefinition[] = [
  { field: 's_bahn_vorhanden',          label: 'S-Bahn',              color: '#00A651' },
  { field: 'u_bahn_vorhanden',          label: 'U-Bahn',              color: '#0072BC' },
  { field: 'tram_vorhanden',            label: 'Tram',                color: '#CC0000' },
  { field: 'bus_vorhanden',             label: 'Bus',                 color: '#F7941D' },
  { field: 'ods_vorhanden',             label: 'On-demand Shuttle',   color: '#9B59B6' },
  { field: 'gaf_ts_vorhanden',          label: 'Carsharing',          color: '#E91E63' },
  { field: 'gaf_bs_vorhanden',          label: 'Bikesharing',         color: '#FFD600' },
  { field: 'gaf_ls_vorhanden',          label: 'Leihscooter',         color: '#00BCD4' },
  { field: 'gaf_ms_vorhanden',          label: 'Mietrad',             color: '#FF8A65' },
  { field: 'radservicestation_vorhanden', label: 'Bike Service Station', color: '#80CBC4' },
  { field: 'radpumpe_vorhanden',        label: 'Bike Pump',           color: '#B0BEC5' },
]

export type GroupKey = 's-bahn' | 'u-bahn' | 'tram' | 'bus' | 'none'

export const GROUP_COLORS: Record<GroupKey, string> = {
  's-bahn': '#00A651',
  'u-bahn': '#0072BC',
  'tram':   '#CC0000',
  'bus':    '#F7941D',
  'none':   '#4a7fa8',
}

export const GROUP_LABELS: Record<GroupKey, string> = {
  's-bahn': 'S-BAHN',
  'u-bahn': 'U-BAHN',
  'tram':   'TRAM',
  'bus':    'BUS',
  'none':   'OTHER',
}

/** Fill color for absent (Nein) arc segments */
export const ABSENT_COLOR = '#0a1220'

/** Page background color */
export const BG_COLOR = '#0f1b2d'

/** Center circle fill */
export const CENTER_FILL = '#0a1220'
```

- [ ] **Step 4: Run test — verify it passes**

```bash
pnpm test
```

Expected: all color tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/colors.ts src/lib/__tests__/colors.test.ts
git commit -m "feat: add service + group color definitions"
```

---

### Task 2: Data parsing

**Files:**
- Create: `src/lib/parseData.ts`
- Create: `src/lib/__tests__/parseData.test.ts`

The CSV has these relevant columns (confirmed from actual file header):
`name, adresse, anz_stellpl_cs, gaf_ts_vorhanden, gaf_bs_vorhanden, gaf_ls_vorhanden, gaf_ms_vorhanden, ods_vorhanden, bus_vorhanden, tram_vorhanden, u_bahn_vorhanden, s_bahn_vorhanden, radservicestation_vorhanden, radpumpe_vorhanden`

All boolean fields are `'Ja'` or `'Nein'` strings.

- [ ] **Step 1: Write the failing test**

Create `src/lib/__tests__/parseData.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { parseCSV, groupStations } from '../parseData'
import type { Station } from '../parseData'

const MINIMAL_CSV = `FID,objectid,mp_id,name,adresse,anz_stellpl_cs,anz_stellpl_taxi,anzahl_ladepunkte_ac,anzahl_ladepunkte_dc,gaf_ts_vorhanden,gaf_bs_vorhanden,gaf_ls_vorhanden,gaf_ms_vorhanden,ods_vorhanden,bus_vorhanden,tram_vorhanden,u_bahn_vorhanden,s_bahn_vorhanden,radservicestation_vorhanden,radpumpe_vorhanden,bearbeitung_datum,shape
id1,1,101,Hauptbahnhof,Bahnhofplatz 1,4,Nein,0,0,Ja,Ja,Nein,Nein,Nein,Nein,Nein,Nein,Ja,Ja,Nein,20260224,POINT (0 0)
id2,2,102,Marienplatz,"Marienplatz 1, 80331",0,Nein,0,0,Nein,Nein,Nein,Nein,Nein,Ja,Nein,Ja,Nein,Nein,Nein,20260224,POINT (0 0)
id3,3,103,Implerstraße,Implerstraße 36,6,Nein,0,0,Ja,Ja,Ja,Ja,Nein,Ja,Nein,Ja,Nein,Nein,Nein,20260224,POINT (0 0)`

describe('parseCSV', () => {
  it('returns one Station per data row', () => {
    const stations = parseCSV(MINIMAL_CSV)
    expect(stations).toHaveLength(3)
  })

  it('maps name and adresse correctly', () => {
    const stations = parseCSV(MINIMAL_CSV)
    expect(stations[0].name).toBe('Hauptbahnhof')
    expect(stations[0].adresse).toBe('Bahnhofplatz 1')
  })

  it('parses anz_stellpl_cs as a number', () => {
    const stations = parseCSV(MINIMAL_CSV)
    expect(stations[0].anzStellplCs).toBe(4)
    expect(stations[1].anzStellplCs).toBe(0)
  })

  it('parses boolean fields as true/false', () => {
    const stations = parseCSV(MINIMAL_CSV)
    // Hauptbahnhof: s_bahn=Ja, gaf_ts=Ja, tram=Nein
    expect(stations[0].services.s_bahn_vorhanden).toBe(true)
    expect(stations[0].services.gaf_ts_vorhanden).toBe(true)
    expect(stations[0].services.tram_vorhanden).toBe(false)
  })

  it('handles comma in quoted address fields', () => {
    const stations = parseCSV(MINIMAL_CSV)
    expect(stations[1].adresse).toBe('Marienplatz 1, 80331')
  })
})

describe('groupStations', () => {
  let stations: Station[]

  beforeEach(() => {
    stations = parseCSV(MINIMAL_CSV)
  })

  it('assigns S-Bahn group to station with s_bahn_vorhanden=true', () => {
    const groups = groupStations(stations)
    const sbahn = groups.find((g) => g.key === 's-bahn')
    expect(sbahn?.stations.some((s) => s.name === 'Hauptbahnhof')).toBe(true)
  })

  it('assigns U-Bahn group (not S-Bahn) when only u_bahn=true', () => {
    const groups = groupStations(stations)
    const ubahn = groups.find((g) => g.key === 'u-bahn')
    expect(ubahn?.stations.some((s) => s.name === 'Marienplatz')).toBe(true)
  })

  it('sorts stations alphabetically within each group', () => {
    const csv = `FID,objectid,mp_id,name,adresse,anz_stellpl_cs,anz_stellpl_taxi,anzahl_ladepunkte_ac,anzahl_ladepunkte_dc,gaf_ts_vorhanden,gaf_bs_vorhanden,gaf_ls_vorhanden,gaf_ms_vorhanden,ods_vorhanden,bus_vorhanden,tram_vorhanden,u_bahn_vorhanden,s_bahn_vorhanden,radservicestation_vorhanden,radpumpe_vorhanden,bearbeitung_datum,shape
x,1,1,Zentraler Ort,Z 1,0,Nein,0,0,Nein,Nein,Nein,Nein,Nein,Ja,Nein,Nein,Nein,Nein,Nein,20260224,POINT (0 0)
y,2,2,Anfang Straße,A 1,0,Nein,0,0,Nein,Nein,Nein,Nein,Nein,Ja,Nein,Nein,Nein,Nein,Nein,20260224,POINT (0 0)`
    const parsed = parseCSV(csv)
    const groups = groupStations(parsed)
    const bus = groups.find((g) => g.key === 'bus')!
    expect(bus.stations[0].name).toBe('Anfang Straße')
    expect(bus.stations[1].name).toBe('Zentraler Ort')
  })

  it('skips empty groups', () => {
    const groups = groupStations(stations)
    // none group has no stations in minimal CSV
    expect(groups.find((g) => g.key === 'none')).toBeUndefined()
  })

  it('returns groups in priority order: s-bahn, u-bahn, tram, bus, none', () => {
    const groups = groupStations(stations)
    const keys = groups.map((g) => g.key)
    // minimal CSV has s-bahn and u-bahn only
    expect(keys.indexOf('s-bahn')).toBeLessThan(keys.indexOf('u-bahn'))
  })

  it('total stations across all groups equals input count', () => {
    const groups = groupStations(stations)
    const total = groups.reduce((sum, g) => sum + g.stations.length, 0)
    expect(total).toBe(stations.length)
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
pnpm test
```

Expected: FAIL — `Cannot find module '../parseData'`

- [ ] **Step 3: Create `src/lib/parseData.ts`**

```typescript
import Papa from 'papaparse'
import type { GroupKey } from './colors'

export interface Station {
  name: string
  adresse: string
  anzStellplCs: number
  services: Record<string, boolean>
}

export interface StationGroup {
  key: GroupKey
  stations: Station[]
}

const BOOL_FIELDS = [
  'gaf_ts_vorhanden',
  'gaf_bs_vorhanden',
  'gaf_ls_vorhanden',
  'gaf_ms_vorhanden',
  'ods_vorhanden',
  'bus_vorhanden',
  'tram_vorhanden',
  'u_bahn_vorhanden',
  's_bahn_vorhanden',
  'radservicestation_vorhanden',
  'radpumpe_vorhanden',
] as const

const GROUP_PRIORITY: { key: GroupKey; field: string }[] = [
  { key: 's-bahn', field: 's_bahn_vorhanden' },
  { key: 'u-bahn', field: 'u_bahn_vorhanden' },
  { key: 'tram',   field: 'tram_vorhanden' },
  { key: 'bus',    field: 'bus_vorhanden' },
  { key: 'none',   field: '' },
]

export function parseCSV(csvText: string): Station[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  })

  return result.data.map((row) => {
    const services: Record<string, boolean> = {}
    for (const field of BOOL_FIELDS) {
      services[field] = row[field] === 'Ja'
    }
    return {
      name: row['name'] ?? '',
      adresse: row['adresse'] ?? '',
      anzStellplCs: parseInt(row['anz_stellpl_cs'] ?? '0', 10) || 0,
      services,
    }
  })
}

export function groupStations(stations: Station[]): StationGroup[] {
  const buckets: Map<GroupKey, Station[]> = new Map()

  for (const station of stations) {
    const match = GROUP_PRIORITY.find(
      ({ key, field }) => key === 'none' || station.services[field] === true,
    )
    const key = match?.key ?? 'none'
    if (!buckets.has(key)) buckets.set(key, [])
    buckets.get(key)!.push(station)
  }

  // Sort each group alphabetically, then return in priority order, skipping empty
  const result: StationGroup[] = []
  for (const { key } of GROUP_PRIORITY) {
    const group = buckets.get(key)
    if (!group || group.length === 0) continue
    group.sort((a, b) => a.name.localeCompare(b.name, 'de'))
    result.push({ key, stations: group })
  }

  return result
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
pnpm test
```

Expected: all parseData tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/parseData.ts src/lib/__tests__/parseData.test.ts
git commit -m "feat: add CSV parsing and station grouping"
```

---

### Task 3: Layout math

**Files:**
- Create: `src/lib/layout.ts`
- Create: `src/lib/__tests__/layout.test.ts`

The layout module computes everything needed to render the visualization: angular positions for each station, SVG arc paths for each ring segment, and label transforms.

- [ ] **Step 1: Write the failing test**

Create `src/lib/__tests__/layout.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  computeLayout,
  degreesToRadians,
  type LayoutResult,
  type StationGeometry,
} from '../layout'
import type { StationGroup } from '../parseData'

// Minimal group fixture: 2 stations in s-bahn, 1 in bus
function makeGroups(counts: number[]): StationGroup[] {
  const keys = ['s-bahn', 'u-bahn', 'tram', 'bus', 'none'] as const
  return counts.map((count, i) => ({
    key: keys[i],
    stations: Array.from({ length: count }, (_, j) => ({
      name: `Station ${j}`,
      adresse: 'Test St',
      anzStellplCs: 0,
      services: {
        s_bahn_vorhanden: i === 0,
        u_bahn_vorhanden: i === 1,
        tram_vorhanden: i === 2,
        bus_vorhanden: i === 3,
        ods_vorhanden: false,
        gaf_ts_vorhanden: false,
        gaf_bs_vorhanden: false,
        gaf_ls_vorhanden: false,
        gaf_ms_vorhanden: false,
        radservicestation_vorhanden: false,
        radpumpe_vorhanden: false,
      },
    })),
  })).filter((_, i) => counts[i] > 0)
}

describe('degreesToRadians', () => {
  it('converts 180° to π', () => {
    expect(degreesToRadians(180)).toBeCloseTo(Math.PI)
  })
  it('converts 0° to 0', () => {
    expect(degreesToRadians(0)).toBe(0)
  })
})

describe('computeLayout', () => {
  const R = 400
  // 2 non-empty groups, 2 gaps × 5° = 10°, available = 350°, total stations = 3
  const groups = makeGroups([2, 0, 0, 1, 0])

  let result: LayoutResult

  beforeEach(() => {
    result = computeLayout(groups, R)
  })

  it('returns one StationGeometry per station', () => {
    expect(result.stations).toHaveLength(3)
  })

  it('first station starts at -π/2 (12 o'clock)', () => {
    // The midAngle of the first station should be close to -π/2 + half-slot
    const first = result.stations[0]
    expect(first.midAngle).toBeGreaterThan(-Math.PI / 2)
    expect(first.midAngle).toBeLessThan(0)
  })

  it('ring radii: 11 rings with equal width between 18% and 46% of R', () => {
    expect(result.rings).toHaveLength(11)
    const expectedWidth = (0.46 - 0.18) * R / 11
    result.rings.forEach((ring, i) => {
      expect(ring.innerR).toBeCloseTo(0.18 * R + i * expectedWidth, 1)
      expect(ring.outerR).toBeCloseTo(0.18 * R + (i + 1) * expectedWidth, 1)
    })
  })

  it('center radius is 15% of R', () => {
    expect(result.centerR).toBeCloseTo(0.15 * R, 1)
  })

  it('label radius is 48% of R', () => {
    expect(result.labelR).toBeCloseTo(0.48 * R, 1)
  })

  it('group arcs: one per non-empty group', () => {
    expect(result.groupArcs).toHaveLength(2)
  })

  it('group arc inner radius is 47% of R, outer is 47.8%', () => {
    result.groupArcs.forEach((arc) => {
      expect(arc.innerR).toBeCloseTo(0.47 * R, 1)
      expect(arc.outerR).toBeCloseTo(0.478 * R, 1)
    })
  })

  it('label anchor: right-half station has flip=false', () => {
    // First station is in top-right — no flip needed
    const first = result.stations[0]
    if (first.midAngle >= -Math.PI / 2 && first.midAngle <= Math.PI / 2) {
      expect(first.labelFlip).toBe(false)
    }
  })

  it('each station has filled arc width narrower than slot width', () => {
    result.stations.forEach((s) => {
      const slotWidth = s.endAngle - s.startAngle
      const fillWidth = s.fillEndAngle - s.fillStartAngle
      expect(fillWidth).toBeLessThan(slotWidth)
      expect(fillWidth).toBeGreaterThan(0)
    })
  })
})
```

- [ ] **Step 2: Run test — verify it fails**

```bash
pnpm test
```

Expected: FAIL — `Cannot find module '../layout'`

- [ ] **Step 3: Create `src/lib/layout.ts`**

```typescript
import { arc as d3arc } from 'd3'
import type { StationGroup } from './parseData'
import type { GroupKey } from './colors'

export interface RingGeometry {
  innerR: number
  outerR: number
  ringIndex: number
}

export interface GroupArcGeometry {
  key: GroupKey
  innerR: number
  outerR: number
  startAngle: number // radians
  endAngle: number   // radians (excludes trailing gap)
  midAngle: number   // for label placement
}

export interface StationGeometry {
  stationIndex: number // index in flat ordered array
  groupKey: GroupKey
  name: string
  adresse: string
  anzStellplCs: number
  services: Record<string, boolean>
  // slot bounds (including padding)
  startAngle: number
  endAngle: number
  // filled arc bounds (slot minus 0.15° padding each side)
  fillStartAngle: number
  fillEndAngle: number
  // label
  midAngle: number      // radians, center of slot
  labelFlip: boolean    // true if left half (180°–360° = π to 2π)
  labelAnchor: 'start' | 'end'
}

export interface StarDot {
  x: number
  y: number
  r: number
  opacity: number
}

export interface LayoutResult {
  R: number
  centerR: number
  ringZoneInnerR: number
  ringZoneOuterR: number
  labelR: number
  groupArcInnerR: number
  groupArcOuterR: number
  rings: RingGeometry[]
  groupArcs: GroupArcGeometry[]
  stations: StationGeometry[]
  starDots: StarDot[]
}

export function degreesToRadians(deg: number): number {
  return (deg * Math.PI) / 180
}

const GAP_DEG = 5
const PADDING_DEG = 0.15 // each side of arc segment

// Static star positions (seed-derived, reproducible)
const STAR_SEEDS = [
  [0.12, 0.91, 1.1, 0.35], [0.67, 0.93, 0.9, 0.22], [0.34, 0.95, 1.4, 0.45],
  [0.89, 0.92, 0.8, 0.28], [0.23, 0.96, 1.5, 0.50], [0.56, 0.94, 1.0, 0.38],
  [0.78, 0.98, 1.2, 0.20], [0.45, 0.93, 0.8, 0.42], [0.01, 0.95, 1.3, 0.30],
  [0.90, 0.97, 0.9, 0.25], [0.19, 0.92, 1.5, 0.48], [0.62, 0.96, 1.1, 0.33],
  [0.37, 0.94, 0.8, 0.40], [0.81, 0.93, 1.4, 0.22], [0.50, 0.98, 1.0, 0.35],
  [0.13, 0.97, 1.2, 0.27], [0.72, 0.91, 0.9, 0.44], [0.28, 0.99, 1.5, 0.50],
  [0.95, 0.92, 0.8, 0.30], [0.41, 0.96, 1.3, 0.38], [0.06, 0.94, 1.1, 0.20],
  [0.85, 0.95, 0.9, 0.45], [0.57, 0.93, 1.4, 0.32], [0.30, 0.98, 0.8, 0.48],
  [0.74, 0.97, 1.2, 0.25],
]

export function computeLayout(groups: StationGroup[], R: number): LayoutResult {
  const totalStations = groups.reduce((s, g) => s + g.stations.length, 0)
  const numGroups = groups.length
  const availableDeg = 360 - numGroups * GAP_DEG
  const slotDeg = availableDeg / totalStations

  // Radii
  const centerR     = 0.15 * R
  const ringInner   = 0.18 * R
  const ringOuter   = 0.46 * R
  const groupInner  = 0.47 * R
  const groupOuter  = 0.478 * R
  const labelR      = 0.48 * R
  const ringWidth   = (ringOuter - ringInner) / 11

  // Build rings
  const rings: RingGeometry[] = Array.from({ length: 11 }, (_, i) => ({
    ringIndex: i,
    innerR: ringInner + i * ringWidth,
    outerR: ringInner + (i + 1) * ringWidth,
  }))

  // Build station geometries and group arcs
  const stations: StationGeometry[] = []
  const groupArcs: GroupArcGeometry[] = []

  // Start at -90° (12 o'clock) in radians
  let curDeg = -90

  let stationIndex = 0
  for (const group of groups) {
    const groupStartDeg = curDeg

    for (const station of group.stations) {
      const startDeg = curDeg
      const endDeg = curDeg + slotDeg
      const midDeg = curDeg + slotDeg / 2

      const startRad = degreesToRadians(startDeg)
      const endRad   = degreesToRadians(endDeg)
      const midRad   = degreesToRadians(midDeg)

      const fillStartRad = degreesToRadians(startDeg + PADDING_DEG)
      const fillEndRad   = degreesToRadians(endDeg - PADDING_DEG)

      // cos(midRad) < 0 means the spoke points to the left half → flip label
      const labelFlip = Math.cos(midRad) < 0

      stations.push({
        stationIndex,
        groupKey: group.key,
        name: station.name,
        adresse: station.adresse,
        anzStellplCs: station.anzStellplCs,
        services: station.services,
        startAngle: startRad,
        endAngle: endRad,
        fillStartAngle: fillStartRad,
        fillEndAngle: fillEndRad,
        midAngle: midRad,
        labelFlip,
        labelAnchor: labelFlip ? 'end' : 'start',
      })

      curDeg = endDeg
      stationIndex++
    }

    const groupEndDeg = curDeg // before gap

    groupArcs.push({
      key: group.key,
      innerR: groupInner,
      outerR: groupOuter,
      startAngle: degreesToRadians(groupStartDeg),
      endAngle: degreesToRadians(groupEndDeg),
      midAngle: degreesToRadians((groupStartDeg + groupEndDeg) / 2),
    })

    curDeg += GAP_DEG // trailing gap
  }

  // Star dots: transform seed [angleFraction, radiusFraction, r, opacity] → cartesian
  const starDots: StarDot[] = STAR_SEEDS.map(([angleFrac, radFrac, r, opacity]) => {
    const angle = angleFrac * 2 * Math.PI
    const radius = R * (0.92 + (radFrac - 0.9) * (0.08 / 0.1)) // map 0.9-1.0 → 0.92-1.00
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
      r,
      opacity,
    }
  })

  return {
    R,
    centerR,
    ringZoneInnerR: ringInner,
    ringZoneOuterR: ringOuter,
    labelR,
    groupArcInnerR: groupInner,
    groupArcOuterR: groupOuter,
    rings,
    groupArcs,
    stations,
    starDots,
  }
}

/** Generate an SVG arc path string using D3's arc generator */
const arcGenerator = d3arc()

export function arcPath(
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number,
): string {
  return arcGenerator({
    innerRadius: innerR,
    outerRadius: outerR,
    startAngle,
    endAngle,
  }) ?? ''
}
```

- [ ] **Step 4: Run test — verify it passes**

```bash
pnpm test
```

Expected: all layout tests PASS. If any floating-point assertions fail, adjust `.toBeCloseTo(x, 1)` precision.

- [ ] **Step 5: Commit**

```bash
git add src/lib/layout.ts src/lib/__tests__/layout.test.ts
git commit -m "feat: add radial layout math (angles, arc paths, label flip)"
```

---

## Chunk 2: Hook + Core Visual Components

### Task 4: `useRadialLayout` hook

**Files:**
- Create: `src/hooks/useRadialLayout.ts`

This hook manages data fetching and layout computation. It accepts `width` and `height` as parameters (measured by the caller via `ResizeObserver`) and returns the computed layout. No `containerRef` — the App component owns the resize observation.

- [ ] **Step 1: Create `src/hooks/useRadialLayout.ts`**

No TDD here — hooks that manage side-effects (fetch) are tested via integration. Write the implementation directly.

> **Critical path note:** The hook is in `src/hooks/`. The CSV lives at the project root `data/`. The correct Vite `?url` import path relative to this file is `../../data/mobilitaetspunkte.csv?url`.

```typescript
import { useState, useEffect, useMemo } from 'react'
import csvUrl from '../../data/mobilitaetspunkte.csv?url'
import { parseCSV, groupStations } from '../lib/parseData'
import { computeLayout } from '../lib/layout'
import type { LayoutResult } from '../lib/layout'
import type { StationGroup } from '../lib/parseData'

interface UseRadialLayoutReturn {
  layout: LayoutResult | null
  groups: StationGroup[]
  error: string | null
}

export function useRadialLayout(width: number, height: number): UseRadialLayoutReturn {
  const [groups, setGroups] = useState<StationGroup[]>([])
  const [error, setError] = useState<string | null>(null)

  // Fetch and parse CSV once on mount
  useEffect(() => {
    fetch(csvUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load CSV: ${res.status}`)
        return res.text()
      })
      .then((text) => {
        const stations = parseCSV(text)
        const grouped = groupStations(stations)
        setGroups(grouped)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err))
      })
  }, [])

  // Compute layout (memoized — only reruns when groups or dimensions change)
  const layout = useMemo<LayoutResult | null>(() => {
    if (groups.length === 0 || width === 0 || height === 0) return null
    const R = Math.min(width, height) / 2
    return computeLayout(groups, R)
  }, [groups, width, height])

  return { layout, groups, error }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm build
```

Expected: build succeeds (App.tsx still shows placeholder). Fix any type errors before proceeding.

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useRadialLayout.ts
git commit -m "feat: add useRadialLayout hook (fetch, parse, layout)"
```

---

### Task 5: `CenterLabel` component

**Files:**
- Create: `src/components/CenterLabel.tsx`

The simplest visual component. Renders the title inside the center circle. Swaps content during ring-hover via CSS opacity transition.

- [ ] **Step 1: Create `src/components/CenterLabel.tsx`**

```tsx
interface CenterLabelProps {
  cx: number
  cy: number
  r: number
  hoveredRingLabel: string | null // null = show title, string = show ring name
}

export function CenterLabel({ cx, cy, r, hoveredRingLabel }: CenterLabelProps) {
  const showTitle = hoveredRingLabel === null

  return (
    <g>
      {/* Center circle background */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="#0a1220"
        stroke="#1a2a45"
        strokeWidth={1}
      />

      {/* Title text — fades out during ring-hover */}
      <g
        style={{
          opacity: showTitle ? 1 : 0,
          transition: 'opacity 150ms ease-out',
        }}
      >
        <text
          x={cx}
          y={cy - 8}
          textAnchor="middle"
          fontSize={7}
          fill="#4a7fa8"
          letterSpacing={1.5}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
        >
          MÜNCHEN
        </text>
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontSize={8.5}
          fill="#c9d8e8"
          fontWeight={600}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
        >
          Mobilitäts-
        </text>
        <text
          x={cx}
          y={cy + 15}
          textAnchor="middle"
          fontSize={8.5}
          fill="#c9d8e8"
          fontWeight={600}
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
        >
          punkte
        </text>
      </g>

      {/* Ring hover label — fades in during ring-hover */}
      <g
        style={{
          opacity: showTitle ? 0 : 1,
          transition: 'opacity 150ms ease-out',
        }}
      >
        <text
          x={cx}
          y={cy + 4}
          textAnchor="middle"
          fontSize={9}
          fill="#c9d8e8"
          fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
        >
          {hoveredRingLabel ?? ''}
        </text>
      </g>
    </g>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm build 2>&1 | head -20
```

Expected: no TypeScript errors in CenterLabel.

- [ ] **Step 3: Commit**

```bash
git add src/components/CenterLabel.tsx
git commit -m "feat: add CenterLabel component with hover crossfade"
```

---

### Task 6: `ServiceRings` component

**Files:**
- Create: `src/components/ServiceRings.tsx`

The main visual element — 11 × 116 arc segments. Receives hover state and adjusts opacity accordingly.

- [ ] **Step 1: Create `src/components/ServiceRings.tsx`**

```tsx
import { arcPath } from '../lib/layout'
import { SERVICE_DEFINITIONS, ABSENT_COLOR } from '../lib/colors'
import type { LayoutResult } from '../lib/layout'

interface ServiceRingsProps {
  layout: LayoutResult
  cx: number
  cy: number
  hoveredStationIndex: number | null
  hoveredRingIndex: number | null
  onStationEnter: (index: number) => void
  onStationLeave: () => void
}

export function ServiceRings({
  layout,
  cx,
  cy,
  hoveredStationIndex,
  hoveredRingIndex,
  onStationEnter,
  onStationLeave,
}: ServiceRingsProps) {
  const isStationHover = hoveredStationIndex !== null
  const isRingHover = hoveredRingIndex !== null

  return (
    <g transform={`translate(${cx},${cy})`}>
      {/* Ring separator lines */}
      {layout.rings.map((ring) => (
        <circle
          key={`sep-${ring.ringIndex}`}
          r={ring.innerR}
          fill="none"
          stroke="#1a2a45"
          strokeWidth={0.5}
        />
      ))}

      {/* Arc segments: iterate stations × rings */}
      {layout.stations.map((station) => {
        // Determine opacity for this station's column
        let stationOpacity: number
        if (isStationHover) {
          stationOpacity = station.stationIndex === hoveredStationIndex ? 1 : 0.08
        } else if (isRingHover) {
          stationOpacity = 1 // per-ring opacity handled below
        } else {
          stationOpacity = 0.85
        }

        // Wrap each station's ring segments in a Fragment to avoid nested-array JSX errors
      return (
        <g key={`station-${station.stationIndex}`}>
          {SERVICE_DEFINITIONS.map((svc, ringIndex) => {
            const ring = layout.rings[ringIndex]
            const hasService = station.services[svc.field] === true

            // Determine final opacity
            let opacity: number
            if (isRingHover) {
              if (ringIndex === hoveredRingIndex) {
                opacity = hasService ? 1 : 0.05
              } else {
                opacity = 0.15
              }
            } else {
              opacity = stationOpacity
            }

            const fill = hasService ? svc.color : ABSENT_COLOR
            const stroke =
              isStationHover && station.stationIndex === hoveredStationIndex && hasService
                ? 'rgba(255,255,255,0.5)'
                : 'none'

            const path = arcPath(ring.innerR, ring.outerR, station.fillStartAngle, station.fillEndAngle)

            return (
              <path
                key={`${station.stationIndex}-${ringIndex}`}
                d={path}
                fill={fill}
                stroke={stroke}
                strokeWidth={0.5}
                opacity={opacity}
                style={{ transition: 'opacity 150ms ease-out' }}
                onMouseEnter={() => onStationEnter(station.stationIndex)}
                onMouseLeave={onStationLeave}
                cursor="crosshair"
              />
            )
          })}
        </g>
      )
      })}
    </g>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm build 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ServiceRings.tsx
git commit -m "feat: add ServiceRings component (11 × 116 arc segments)"
```

---

### Task 7: `StationLabels` component

**Files:**
- Create: `src/components/StationLabels.tsx`

116 text labels radiating outward, rotated along their spoke. Left-half labels are flipped for readability.

- [ ] **Step 1: Create `src/components/StationLabels.tsx`**

```tsx
import type { LayoutResult } from '../lib/layout'

interface StationLabelsProps {
  layout: LayoutResult
  cx: number
  cy: number
  hoveredStationIndex: number | null
  isRingHover: boolean
  onStationEnter: (index: number) => void
  onStationLeave: () => void
}

export function StationLabels({
  layout,
  cx,
  cy,
  hoveredStationIndex,
  isRingHover,
  onStationEnter,
  onStationLeave,
}: StationLabelsProps) {
  const R = layout.labelR

  return (
    <g transform={`translate(${cx},${cy})`}>
      {layout.stations.map((station) => {
        const isHovered = station.stationIndex === hoveredStationIndex

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

        // SVG transform strategy for radial labels:
        // 1. rotate(angleDeg)  — spin to face the spoke direction
        // 2. translate(R, 0)   — move out to label radius along the (now-rotated) x-axis
        // 3. For left-half labels: add rotate(180) so text reads left-to-right
        //    and set text-anchor:"end" so text extends toward center, not away
        //
        // SVG transforms apply right-to-left, so the combined transform is:
        //   Right half: rotate(angleDeg) translate(R, 0)
        //   Left half:  rotate(angleDeg) translate(R, 0) rotate(180)
        //
        // midAngle is in radians. Convert to degrees for SVG rotate().
        const angleDeg = (station.midAngle * 180) / Math.PI

        const transform = station.labelFlip
          ? `rotate(${angleDeg}) translate(${R}, 0) rotate(180)`
          : `rotate(${angleDeg}) translate(${R}, 0)`

        return (
          <text
            key={station.stationIndex}
            transform={transform}
            textAnchor={station.labelAnchor}
            dominantBaseline="middle"
            fontSize="clamp(5.5px, 0.8vw, 8px)"
            fontWeight={300}
            fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
            fill={fill}
            opacity={opacity}
            style={{ transition: 'opacity 150ms ease-out, fill 150ms ease-out' }}
            onMouseEnter={() => onStationEnter(station.stationIndex)}
            onMouseLeave={onStationLeave}
            cursor="default"
            userSelect="none"
          >
            {station.name}
          </text>
        )
      })}
    </g>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm build 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/components/StationLabels.tsx
git commit -m "feat: add StationLabels component with rotation + flip logic"
```

---

### Task 8: `GroupMarkers` component

**Files:**
- Create: `src/components/GroupMarkers.tsx`

Thin colored arcs outside the ring zone, one per transit group. Plus a small group name label.

- [ ] **Step 1: Create `src/components/GroupMarkers.tsx`**

```tsx
import { arcPath } from '../lib/layout'
import { GROUP_COLORS, GROUP_LABELS } from '../lib/colors'
import type { LayoutResult } from '../lib/layout'

interface GroupMarkersProps {
  layout: LayoutResult
  cx: number
  cy: number
}

export function GroupMarkers({ layout, cx, cy }: GroupMarkersProps) {
  return (
    <g transform={`translate(${cx},${cy})`}>
      {layout.groupArcs.map((groupArc) => {
        const color = GROUP_COLORS[groupArc.key]
        const label = GROUP_LABELS[groupArc.key]

        // Arc path for the group marker band
        const path = arcPath(
          groupArc.innerR,
          groupArc.outerR,
          groupArc.startAngle,
          groupArc.endAngle,
        )

        // Label position: 49.5% R along the midpoint angle
        const labelR = layout.R * 0.495
        const lx = labelR * Math.sin(groupArc.midAngle) // sin for x in SVG (0° = top)
        const ly = -labelR * Math.cos(groupArc.midAngle) // -cos for y

        return (
          <g key={groupArc.key}>
            <path d={path} fill={color} opacity={0.8} />
            <text
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={7}
              fill="#4a7fa8"
              letterSpacing={1.5}
              fontFamily="'Helvetica Neue', Helvetica, Arial, sans-serif"
              userSelect="none"
            >
              {label}
            </text>
          </g>
        )
      })}
    </g>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm build 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/components/GroupMarkers.tsx
git commit -m "feat: add GroupMarkers component (transit group arcs + labels)"
```

---

## Chunk 3: Interactive Layer + App Shell

### Task 9: `RadialViz` — SVG shell + hover state

**Files:**
- Create: `src/components/RadialViz.tsx`

The SVG root. Owns all hover state. Wires geometry and hover signals to all child components.

- [ ] **Step 1: Create `src/components/RadialViz.tsx`**

```tsx
import { useState, useCallback } from 'react'
import type { LayoutResult } from '../lib/layout'
import type { StationGroup } from '../lib/parseData'
import { SERVICE_DEFINITIONS } from '../lib/colors'
import { ServiceRings } from './ServiceRings'
import { StationLabels } from './StationLabels'
import { GroupMarkers } from './GroupMarkers'
import { CenterLabel } from './CenterLabel'

interface RadialVizProps {
  layout: LayoutResult
  groups: StationGroup[]
  width: number
  height: number
  hoveredRingIndex: number | null // controlled by Legend
}

export interface RadialVizHandlers {
  onStationHoverChange: (index: number | null) => void
}

export function RadialViz({
  layout,
  groups: _groups,
  width,
  height,
  hoveredRingIndex,
}: RadialVizProps) {
  const [hoveredStationIndex, setHoveredStationIndex] = useState<number | null>(null)

  const handleStationEnter = useCallback((index: number) => {
    setHoveredStationIndex(index)
  }, [])

  const handleStationLeave = useCallback(() => {
    setHoveredStationIndex(null)
  }, [])

  const cx = width / 2
  const cy = height / 2

  const hoveredRingLabel =
    hoveredRingIndex !== null ? SERVICE_DEFINITIONS[hoveredRingIndex]?.label ?? null : null

  // Star dots
  const { starDots } = layout

  return (
    <svg
      width={width}
      height={height}
      style={{ display: 'block', background: '#0f1b2d' }}
    >
      {/* Star field */}
      <g transform={`translate(${cx},${cy})`}>
        {starDots.map((dot, i) => (
          <circle
            key={i}
            cx={dot.x}
            cy={dot.y}
            r={dot.r}
            fill="white"
            opacity={dot.opacity}
          />
        ))}
      </g>

      {/* Group markers (behind rings) */}
      <GroupMarkers layout={layout} cx={cx} cy={cy} />

      {/* Service rings */}
      <ServiceRings
        layout={layout}
        cx={cx}
        cy={cy}
        hoveredStationIndex={hoveredStationIndex}
        hoveredRingIndex={hoveredRingIndex}
        onStationEnter={handleStationEnter}
        onStationLeave={handleStationLeave}
      />

      {/* Station labels */}
      <StationLabels
        layout={layout}
        cx={cx}
        cy={cy}
        hoveredStationIndex={hoveredStationIndex}
        isRingHover={hoveredRingIndex !== null}
        onStationEnter={handleStationEnter}
        onStationLeave={handleStationLeave}
      />

      {/* Center label */}
      <CenterLabel
        cx={cx}
        cy={cy}
        r={layout.centerR}
        hoveredRingLabel={hoveredRingLabel}
      />
    </svg>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm build 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/components/RadialViz.tsx
git commit -m "feat: add RadialViz SVG shell with hover state management"
```

---

### Task 10: `Tooltip` component

**Files:**
- Create: `src/components/Tooltip.tsx`

An absolutely positioned `<div>` rendered via `createPortal` to `document.body`. Follows mouse, stays within viewport.

- [ ] **Step 1: Create `src/components/Tooltip.tsx`**

```tsx
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { SERVICE_DEFINITIONS } from '../lib/colors'
import type { StationGeometry } from '../lib/layout'

interface TooltipProps {
  station: StationGeometry | null
  mouseX: number
  mouseY: number
}

export function Tooltip({ station, mouseX, mouseY }: TooltipProps) {
  const [pos, setPos] = useState({ x: mouseX, y: mouseY })

  useEffect(() => {
    if (station === null) return
    const OFFSET = 12
    const W = 220
    const H = 180 // estimated max height

    let x = mouseX + OFFSET
    let y = mouseY + OFFSET

    if (x + W > window.innerWidth) x = mouseX - W - OFFSET
    if (y + H > window.innerHeight) y = mouseY - H - OFFSET

    setPos({ x, y })
  }, [mouseX, mouseY, station])

  if (station === null) return null

  const activeServices = SERVICE_DEFINITIONS.filter(
    (svc) => station.services[svc.field] === true,
  )

  const tooltip = (
    <div
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        background: '#0a1220',
        border: '1px solid #1a2a45',
        borderRadius: 6,
        padding: '12px 14px',
        maxWidth: 220,
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
        pointerEvents: 'none',
        zIndex: 1000,
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color: '#c9d8e8', marginBottom: 2 }}>
        {station.name}
      </div>
      <div style={{ fontSize: 11, color: '#6a94b0', marginBottom: 8 }}>
        {station.adresse}
      </div>
      <div style={{ borderTop: '1px solid #1a2a45', paddingTop: 8, marginBottom: 8 }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px 8px',
          }}
        >
          {activeServices.map((svc) => (
            <div
              key={svc.field}
              style={{ display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: svc.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 11, color: '#8ab4d4' }}>{svc.label}</span>
            </div>
          ))}
        </div>
      </div>
      {station.anzStellplCs > 0 && (
        <div style={{ borderTop: '1px solid #1a2a45', paddingTop: 8 }}>
          <span style={{ fontSize: 11, color: '#6a94b0' }}>
            Carsharing-Stellplätze: {station.anzStellplCs}
          </span>
        </div>
      )}
    </div>
  )

  return createPortal(tooltip, document.body)
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm build 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Tooltip.tsx
git commit -m "feat: add Tooltip component (portal, viewport clamping)"
```

---

### Task 11: `Legend` component

**Files:**
- Create: `src/components/Legend.tsx`

Bottom strip. Triggers ring-hover. Manages its own opacity based on hover state.

- [ ] **Step 1: Create `src/components/Legend.tsx`**

```tsx
import { SERVICE_DEFINITIONS } from '../lib/colors'

interface LegendProps {
  hoveredRingIndex: number | null
  isStationHover: boolean
  onRingEnter: (index: number) => void
  onRingLeave: () => void
}

export function Legend({ hoveredRingIndex, isStationHover, onRingEnter, onRingLeave }: LegendProps) {
  const isRingHover = hoveredRingIndex !== null
  const containerOpacity = isRingHover || isStationHover ? 1 : 0.5

  return (
    <div
      style={{
        height: 48,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: '0 16px',
        opacity: containerOpacity,
        transition: 'opacity 150ms ease-out',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: '#4a7fa8',
          letterSpacing: 1,
          marginBottom: 4,
          userSelect: 'none',
        }}
      >
        SERVICE RINGS (inner → outer)
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', justifyContent: 'center' }}>
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
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
              }}
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
                  fontSize: 11,
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

- [ ] **Step 2: Verify TypeScript compiles**

```bash
pnpm build 2>&1 | head -20
```

- [ ] **Step 3: Commit**

```bash
git add src/components/Legend.tsx
git commit -m "feat: add Legend component with ring-hover triggers"
```

---

### Task 12: App shell — wire everything together

**Files:**
- Modify: `src/App.tsx` (replace placeholder)
- Modify: `src/App.css` (add layout rules)
- Modify: `src/hooks/useRadialLayout.ts` (fix CSV import path — relative to hook, not `src/`)

The App owns the top-level hover state, feeds `RadialViz` and `Legend`, and handles mouse tracking for the tooltip.

- [ ] **Step 1: Confirm CSV import path in `useRadialLayout.ts`**

Task 4 already writes the correct path: `../../data/mobilitaetspunkte.csv?url`. Verify the file still has this path (no accidental revert):

```bash
grep "csvUrl" src/hooks/useRadialLayout.ts
```

Expected output: `import csvUrl from '../../data/mobilitaetspunkte.csv?url'`

If it shows `'../data/...'` instead, correct it to `'../../data/mobilitaetspunkte.csv?url'`.

- [ ] **Step 2: Update `src/App.tsx`**

```tsx
import { useState, useCallback, useEffect, useRef } from 'react'
import { useRadialLayout } from './hooks/useRadialLayout'
import { RadialViz } from './components/RadialViz'
import { Legend } from './components/Legend'
import { Tooltip } from './components/Tooltip'
import type { StationGeometry } from './lib/layout'

export default function App() {
  // Measure SVG container dimensions here in App — hook accepts them as params
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

  // Hover state — lifted here so Legend and RadialViz can share it
  const [hoveredRingIndex, setHoveredRingIndex] = useState<number | null>(null)
  const [hoveredStationIndex, setHoveredStationIndex] = useState<number | null>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  // Track mouse position for tooltip
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }, [])

  // Find hovered station geometry for tooltip
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
        flexDirection: 'column',
        height: '100vh',
        background: '#0f1b2d',
      }}
      onMouseMove={handleMouseMove}
    >
      {/* SVG container — flex:1, takes all space above legend */}
      <div ref={svgContainerRef} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {layout && svgDimensions.width > 0 ? (
          <RadialViz
            layout={layout}
            groups={groups}
            width={svgDimensions.width}
            height={svgDimensions.height}
            hoveredRingIndex={hoveredRingIndex}
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

      {/* Legend strip */}
      <Legend
        hoveredRingIndex={hoveredRingIndex}
        isStationHover={hoveredStationIndex !== null}
        onRingEnter={setHoveredRingIndex}
        onRingLeave={() => setHoveredRingIndex(null)}
      />

      {/* Tooltip */}
      <Tooltip station={hoveredStation} mouseX={mousePos.x} mouseY={mousePos.y} />
    </div>
  )
}
```

> **Note:** The `useRadialLayout` hook has its own `containerRef` — but we now measure the SVG container in App directly with a separate `ResizeObserver`. Remove the unused `containerRef` export from the hook, or simply ignore it. Simplest fix: remove `containerRef` from `useRadialLayout` and keep only `dimensions` as internal state. See Step 3.

- [ ] **Step 3: Verify hook signature in App.tsx matches Task 4 implementation**

The hook signature from Task 4 is `useRadialLayout(width, height)`. Confirm the App calls it correctly:

```tsx
const { layout, groups, error } = useRadialLayout(svgDimensions.width, svgDimensions.height)
```

This is already written in Step 2 above. No changes needed here — just verify consistency.

- [ ] **Step 4: Add final CSS to `src/App.css`**

Append to the existing file:

```css
/* Ensure SVG text is sharp */
svg text {
  -webkit-font-smoothing: antialiased;
  shape-rendering: crispEdges;
}

/* Smooth arc transitions */
svg path {
  transition: opacity 150ms ease-out;
}
```

- [ ] **Step 5: Full build + verify**

```bash
pnpm build
```

Expected: builds successfully with no TypeScript errors, no console warnings. Fix all errors before proceeding.

- [ ] **Step 6: Run dev server — visual check**

```bash
pnpm dev
```

Open `http://localhost:5173`. Verify:
- Dark navy background appears
- After ~1s, the radial visualization loads (116 stations, 11 rings)
- Hovering a station arc highlights that station and dims others
- Tooltip appears with name, address, and active services
- Hovering a legend item dims arcs in other rings
- Center circle shows "Mobilitätspunkte" by default, service name during ring-hover

Kill dev server when satisfied.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/App.css src/hooks/useRadialLayout.ts
git commit -m "feat: wire App shell — layout, tooltip, legend, hover state"
```

---

### Task 13: Vercel deploy

**Files:**
- `vercel.json` — already created in Task 0

- [ ] **Step 1: Verify `vercel.json` is correct**

Check that `vercel.json` contains:
```json
{
  "framework": null,
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "installCommand": "pnpm install"
}
```

- [ ] **Step 2: Run production build**

```bash
pnpm build
```

Expected: `dist/` directory created, no errors. Check output:
```bash
ls dist/
```
Should see: `index.html`, `assets/` directory.

- [ ] **Step 3: Preview production build locally**

```bash
pnpm preview
```

Open `http://localhost:4173`. Verify visualization works identically to dev mode. Kill preview server.

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: final integration — all components wired, production build verified"
```

- [ ] **Step 5: Deploy to Vercel**

Use the `vercel:deploy` skill:
```
/vercel:deploy
```

Or manually:
```bash
vercel --prod
```

- [ ] **Step 6: Verify production URL**

Open the Vercel URL. Confirm visualization loads, hover states work, no console errors.

---

## Post-Implementation Checklist

- [ ] All 116 stations render
- [ ] Stations grouped: S-Bahn (18), U-Bahn (41), Tram (15), Bus (24), None (18)
- [ ] 11 service rings visible, colors match spec
- [ ] Station hover: arc highlights, others dim, tooltip shows name/address/services
- [ ] Ring hover (from legend): correct ring highlighted, center label swaps, no tooltip
- [ ] Labels readable — right half normal, left half flipped
- [ ] Group markers visible with correct transit colors
- [ ] Star field visible in outer zone
- [ ] Responsive: works at 480px, 900px, 1440px+ viewports
- [ ] Production build deployed and verified at Vercel URL
