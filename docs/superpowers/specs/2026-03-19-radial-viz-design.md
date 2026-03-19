# Mobilitätspunkte München — Radial Visualization Design Spec
**Date:** 2026-03-19
**Status:** Approved

---

## 1. Goal

Build a single-page radial visualization of Munich's 116 Mobilitätspunkte (mobility hubs). Each hub is shown as a labeled spoke radiating outward from a central circle. Concentric service rings inside the circle reveal which of 11 services each hub offers. The default state looks like an editorial poster; hovering adds an interactive layer.

---

## 2. Data

**Source:** `data/mobilitaetspunkte.csv` (116 rows)

**Fields used in rings / grouping:**

| Field | Ring | Description |
|---|---|---|
| `s_bahn_vorhanden` | Ring 1 | S-Bahn present (Ja/Nein) |
| `u_bahn_vorhanden` | Ring 2 | U-Bahn present |
| `tram_vorhanden` | Ring 3 | Tram present |
| `bus_vorhanden` | Ring 4 | Bus present |
| `ods_vorhanden` | Ring 5 | On-demand shuttle present |
| `gaf_ts_vorhanden` | Ring 6 | Carsharing present (Teilauto/GAF) |
| `gaf_bs_vorhanden` | Ring 7 | Bikesharing present |
| `gaf_ls_vorhanden` | Ring 8 | Leihscooter present |
| `gaf_ms_vorhanden` | Ring 9 | Mietrad (rental bike) present |
| `radservicestation_vorhanden` | Ring 10 | Bike service station |
| `radpumpe_vorhanden` | Ring 11 | Bike pump |

**Fields used in tooltip only (not rings):**

| Field | Description |
|---|---|
| `name` | Station name (label text) |
| `adresse` | Street address |
| `anz_stellpl_cs` | Number of carsharing parking spots (numeric) |

**The Carsharing ring (Ring 6) is driven by `gaf_ts_vorhanden`.** `anz_stellpl_cs` is displayed in the tooltip as supplementary info only.

**Dominant transit grouping** (priority order, first match wins):
1. S-Bahn (`s_bahn_vorhanden = Ja`)
2. U-Bahn (`u_bahn_vorhanden = Ja`)
3. Tram (`tram_vorhanden = Ja`)
4. Bus (`bus_vorhanden = Ja`)
5. None (mobility-only hubs with no heavy transit)

Within each group, stations are sorted alphabetically by `name`. Empty groups are skipped (no gap rendered). Based on actual data, all 5 groups are non-empty: S-Bahn (18), U-Bahn (41), Tram (15), Bus (24), None (18) = 116 total.

---

**Explicit field → label → color mapping (rings 1–11):**

| # | CSV field | Display label | Ring color |
|---|---|---|---|
| 1 | `s_bahn_vorhanden` | S-Bahn | `#00A651` |
| 2 | `u_bahn_vorhanden` | U-Bahn | `#0072BC` |
| 3 | `tram_vorhanden` | Tram | `#CC0000` |
| 4 | `bus_vorhanden` | Bus | `#F7941D` |
| 5 | `ods_vorhanden` | On-demand Shuttle | `#9B59B6` |
| 6 | `gaf_ts_vorhanden` | Carsharing | `#E91E63` |
| 7 | `gaf_bs_vorhanden` | Bikesharing | `#FFD600` |
| 8 | `gaf_ls_vorhanden` | Leihscooter | `#00BCD4` |
| 9 | `gaf_ms_vorhanden` | Mietrad | `#FF8A65` |
| 10 | `radservicestation_vorhanden` | Bike Service Station | `#80CBC4` |
| 11 | `radpumpe_vorhanden` | Bike Pump | `#B0BEC5` |

**Group arc colors:**

| Group | Color |
|---|---|
| S-Bahn | `#00A651` |
| U-Bahn | `#0072BC` |
| Tram | `#CC0000` |
| Bus | `#F7941D` |
| None (mobility-only) | `#4a7fa8` |

---

## 3. Visual Structure

```
[  background: dark navy #0f1b2d  ]
         ┌──────────────────────────────────────┐
         │   station labels (spokes, outward)   │
         │  ┌────────────────────────────────┐  │
         │  │   11 service rings (arcs)      │  │
         │  │   ┌──────────────────────┐     │  │
         │  │   │  center circle       │     │  │
         │  │   │  "Mobilitätspunkte   │     │  │
         │  │   │   München"           │     │  │
         │  │   └──────────────────────┘     │  │
         │  └────────────────────────────────┘  │
         │  thin colored group arc (outermost)  │
         └──────────────────────────────────────┘
```

### Radii (as % of `R = Math.min(width, height) / 2`)

| Zone | Inner | Outer | Notes |
|---|---|---|---|
| Center circle | 0% | 15% | Title area |
| Gap | 15% | 18% | Breathing room |
| Ring zone | 18% | 46% | 11 service rings |
| Whitespace gap | 46% | 47% | Intentional visual separation |
| Group arc | 47% | 47.8% | 2.5px colored arc per group |
| Label zone | 48% | 90% | Station name spokes |
| Breathing room | 90% | 92% | Intentional dead space between labels and star zone |
| Star zone | 92% | 100% | 25 scattered static dots |

### Angular layout

- **Start angle:** 0° = 12 o'clock (top), i.e. `-π/2` in SVG/D3 math. The first station of the first group (S-Bahn, alphabetical) begins at the top.
- **Gap placement:** Each 5° gap falls *after* the last station of its group (trailing gap before the next group begins).
- Total: 360°
- Number of gaps: equal to the number of non-empty groups (each group gets a trailing gap, including the last — this creates a clean full-circle separation)
- Available degrees: 360° − (numNonEmptyGroups × 5°)
- Each station: availableDeg / 116 degrees of arc
- Arc segment fill: station arc width − 0.3° padding (0.15° on each side)
  - E.g. with 4 non-empty groups: 340° / 116 ≈ 2.93° per slot; filled arc ≈ 2.63°

### Service rings (inner → outer)

| Ring | Service | Source field | Color |
|---|---|---|---|
| 1 (innermost) | S-Bahn | `s_bahn_vorhanden` | `#00A651` |
| 2 | U-Bahn | `u_bahn_vorhanden` | `#0072BC` |
| 3 | Tram | `tram_vorhanden` | `#CC0000` |
| 4 | Bus | `bus_vorhanden` | `#F7941D` |
| 5 | On-demand shuttle | `ods_vorhanden` | `#9B59B6` |
| 6 | Carsharing | `gaf_ts_vorhanden` | `#E91E63` |
| 7 | Bikesharing | `gaf_bs_vorhanden` | `#FFD600` |
| 8 | Leihscooter | `gaf_ls_vorhanden` | `#00BCD4` |
| 9 | Mietrad | `gaf_ms_vorhanden` | `#FF8A65` |
| 10 | Bike service station | `radservicestation_vorhanden` | `#80CBC4` |
| 11 (outermost) | Bike pump | `radpumpe_vorhanden` | `#B0BEC5` |

Each ring is radially equal: `ringWidth = (46% − 18%) × R / 11`.

A segment is filled with the service color at opacity 0.85 when `vorhanden = 'Ja'`, otherwise filled with `#0a1220` (background-matching dark, not transparent).

Thin ring separators: 0.5px stroke at `#1a2a45` at the inner radius of each ring.

### Station labels

- Font: `'Helvetica Neue', sans-serif`
- Size: `clamp(5.5px, 0.8vw, 8px)` — reference: 6.5px at 900px viewport width
- Weight: 300
- Color: `#6a94b0` (resting), `#c9d8e8` (hovered station)
- Positioned at `48% × R` from center, along the station's midpoint angle
- Rotation: text rotated so it aligns with the radial spoke
  - Right half (0°–180°): `text-anchor: start`, no flip
  - Left half (180°–360°): rotate +180°, `text-anchor: end` — text always reads left-to-right

### Group markers

- Thin arc (2.5px wide) at 47%–47.8% R, colored by group transit color
- Small group label at group angular midpoint, placed at 49.5% R: 7px, `letter-spacing: 1.5px`, `#4a7fa8`
- Labels: `S-BAHN`, `U-BAHN`, `TRAM`, `BUS` (and `OTHER` if None group exists)
- Group colors: S-Bahn `#00A651`, U-Bahn `#0072BC`, Tram `#CC0000`, Bus `#F7941D`, None `#4a7fa8`

### Center circle

- Radius: 15% × R
- Fill: `#0a1220`, stroke: `#1a2a45` 1px
- **Default content:**
  - `MÜNCHEN` — 7px, `#4a7fa8`, letter-spacing 1.5px, centered at y = −8px
  - `Mobilitäts-` — 8.5px, `#c9d8e8`, weight 600, y = +4px
  - `punkte` — 8.5px, `#c9d8e8`, weight 600, y = +15px
- **During ring-hover:** title text fades to opacity 0 (150ms), ring label text fades in at full opacity. Ring label: service name in 9px `#c9d8e8`.
- **During station-hover:** title text remains unchanged.

### Background

- Fill: `#0f1b2d`
- 25 scattered star dots: `r` between 0.8–1.5px, opacity 0.2–0.5, positioned pseudo-randomly outside the label zone (beyond 92% R). Coordinates are static (hardcoded seed-derived values, not animated).

---

## 4. Interactivity

**Hover target precedence:** Ring-hover is triggered exclusively from the Legend (see §6), not from the SVG ring arcs themselves. This avoids geometric ambiguity. Mousing over any arc segment in the ring zone always triggers station-hover.

### Hover — station label or ring arc segment

- Hovered station's arc segments: opacity 1.0, thin white stroke 0.5px
- All other stations' arc segments: opacity 0.08
- Hovered station label: color `#c9d8e8`
- All other station labels: opacity 0.2
- Tooltip: visible (see §5)
- Center circle: title unchanged

### Hover — legend service item

- All arc segments in the hovered service ring where service = Ja: opacity 1.0
- All arc segments in the hovered service ring where service = Nein: opacity 0.05
- All arc segments in all other rings: opacity 0.15
- All station labels: opacity 0.3
- Center circle: title fades out, ring label fades in
- Tooltip: hidden

### Default (no hover)

- All segments: opacity 0.85
- All station labels: `#6a94b0`
- Legend visible at low opacity (0.5)
- No tooltip

### Transitions

- CSS transitions / React state, 150ms ease-out for all opacity changes (not D3 transitions — `d3.transition()` requires DOM manipulation which is out of scope per §7)
- Center text crossfade: React state swap with CSS `transition: opacity 150ms ease-out`; outgoing opacity 0 over 100ms, incoming from 0 over 150ms via a brief delay

---

## 5. Tooltip

Absolutely-positioned `<div>` outside the SVG. Follows mouse at +12px offset (adjusts to stay within viewport).

**Content:**
```
[Station name — 13px, #c9d8e8, semibold]
[adresse — 11px, #6a94b0]
────────────────────────
[Active services: each shown as an 8px filled circle in service color
 + service display label, 11px #8ab4d4, flex-wrap, gap 6px 8px]
────────────────────────
[If anz_stellpl_cs > 0: "Carsharing-Stellplätze: [n]" — 11px, #6a94b0]
```

**Style:** background `#0a1220`, border `1px solid #1a2a45`, border-radius 6px, padding 12px 14px, max-width 220px, box-shadow `0 4px 16px rgba(0,0,0,0.5)`, pointer-events none.

**Visibility:** only shown during station-hover (not ring-hover).

---

## 6. Legend

Horizontal strip, bottom-center of the page, below the SVG. Separate `<div>` (not SVG).

- Section label: `SERVICE RINGS (inner → outer)` — 10px, `#4a7fa8`, letter-spacing 1px
- 11 items in a flex row, wrapping: colored dot (10px circle) + service name (11px, `#8ab4d4`)
- Each item is hoverable → triggers ring-hover state for that service (see §4)
- Cursor: `pointer` on legend items

**Opacity states:**
- Default (no hover): 0.5
- During station-hover: 1.0 (fully visible)
- During ring-hover: 1.0 (fully visible; hovered legend item highlighted with `#c9d8e8` label color, others dimmed to 0.4)

---

## 7. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Vite + React 18 |
| Visualization | D3 v7 (math only — arc generator, angle math) |
| Rendering | React JSX for all SVG elements — no `d3.select()` |
| Styling | Plain CSS (no Tailwind) |
| Data loading | `import csvUrl from '../data/mobilitaetspunkte.csv?url'` + `fetch` + `papaparse` (path relative to `src/`, data sits at project root) |
| Deploy | Vercel — `vercel.json` with `framework: null`, explicit `buildCommand`, `outputDirectory`, `installCommand` |

---

## 8. File Structure

```
mobilitaetspunkte-viz/
├── data/
│   └── mobilitaetspunkte.csv
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── lib/
│   │   ├── parseData.ts       # CSV string → Station[]; grouping + sort logic; pure functions
│   │   ├── layout.ts          # Pure math: angular positions, arc path strings, label flip logic
│   │   └── colors.ts          # SERVICE_COLORS map, GROUP_COLORS map
│   ├── hooks/
│   │   └── useRadialLayout.ts # useMemo wrapper: calls parseData + layout fns, returns geometry
│   └── components/
│       ├── RadialViz.tsx      # SVG root; owns hover state; wires geometry → children
│       ├── ServiceRings.tsx   # Renders 11 × 116 arc segments
│       ├── StationLabels.tsx  # Renders 116 text spokes
│       ├── GroupMarkers.tsx   # Renders colored group arcs + labels
│       ├── CenterLabel.tsx    # Title + ring-hover label in center circle
│       ├── Tooltip.tsx        # Absolute div tooltip (portal to body)
│       └── Legend.tsx         # Bottom legend strip with ring-hover triggers
├── public/
├── index.html
├── vite.config.ts
├── vercel.json
├── package.json
└── tsconfig.json
```

**Responsibility split:**
- `lib/` — pure TypeScript functions, no React imports, fully unit-testable
- `hooks/useRadialLayout.ts` — calls lib functions inside `useMemo`, returns computed geometry objects; takes `width, height` as input
- Components receive pre-computed geometry as props; no layout math inside components

---

## 9. Responsive Behavior

**Layout:**
- Page structure: `display: flex; flex-direction: column; height: 100vh`
- SVG container: `flex: 1` (takes all remaining height after the legend div)
- Legend div: fixed height ~48px at the bottom
- SVG element: `width="100%" height="100%"` inside its flex container, `viewBox` set dynamically
- `R = Math.min(containerWidth, containerHeight) / 2` — computed from the SVG container dimensions via `ResizeObserver`

**Text:**
- Station label font: `clamp(5.5px, 0.8vw, 8px)` — reference: 6.5px at 900px wide viewport
- Tooltip font: fixed 11–13px (not scaled with viewport)

**Limits:**
- Minimum supported viewport: 480px wide (labels may overlap below this — acceptable)
- `ResizeObserver` on the SVG container re-triggers `useRadialLayout` on resize

---

## 10. Out of Scope

- Geographic map view
- Filtering UI (ring-hover via legend is the discovery mechanism)
- Animated entrance / load animation
- Mobile touch events (desktop-first)
- Printing / PDF export
