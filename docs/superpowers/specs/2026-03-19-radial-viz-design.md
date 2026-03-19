# Mobilitätspunkte München — Radial Visualization Design Spec
**Date:** 2026-03-19
**Status:** Approved

---

## 1. Goal

Build a single-page radial visualization of Munich's 116 Mobilitätspunkte (mobility hubs). Each hub is shown as a labeled spoke radiating outward from a central circle. Concentric service rings inside the circle reveal which of 11 services each hub offers. The default state looks like an editorial poster; hovering adds an interactive layer.

---

## 2. Data

**Source:** `data/mobilitaetspunkte.csv` (116 rows)

**Fields used:**

| Field | Description |
|---|---|
| `name` | Station name (label text) |
| `s_bahn_vorhanden` | S-Bahn present (Ja/Nein) |
| `u_bahn_vorhanden` | U-Bahn present |
| `tram_vorhanden` | Tram present |
| `bus_vorhanden` | Bus present |
| `ods_vorhanden` | On-demand shuttle present |
| `gaf_ts_vorhanden` | Carsharing present |
| `gaf_bs_vorhanden` | Bikesharing present |
| `gaf_ls_vorhanden` | Leihscooter present |
| `gaf_ms_vorhanden` | Mietrad (rental bike) present |
| `radservicestation_vorhanden` | Bike service station |
| `radpumpe_vorhanden` | Bike pump |
| `anz_stellpl_cs` | Number of carsharing spots (numeric) |

**Dominant transit grouping** (priority order, first match wins):
1. S-Bahn
2. U-Bahn
3. Tram
4. Bus
5. None (mobility-only hubs)

Within each group, stations are sorted alphabetically by `name`.

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

### Radii (as % of min(width, height) / 2)

| Zone | Inner r | Outer r |
|---|---|---|
| Center circle | 0 | 15% |
| Ring zone | 18% | 46% |
| Label zone | 48% | ~90% |
| Group arc | 47% | 47.8% |

### Angular layout

- Total: 360°
- 4 group gaps: 5° each → 340° available for stations
- Each station: 340° / 116 ≈ 2.93° per station
- 0.3° padding between adjacent arc segments

### Service rings (inner → outer order)

| Ring | Service | Color |
|---|---|---|
| 1 (innermost) | S-Bahn | `#00A651` |
| 2 | U-Bahn | `#0072BC` |
| 3 | Tram | `#CC0000` |
| 4 | Bus | `#F7941D` |
| 5 | On-demand shuttle | `#9B59B6` |
| 6 | Carsharing | `#E91E63` |
| 7 | Bikesharing | `#FFD600` |
| 8 | Leihscooter | `#00BCD4` |
| 9 | Mietrad | `#FF8A65` |
| 10 | Bike service station | `#80CBC4` |
| 11 (outermost) | Bike pump | `#B0BEC5` |

Each ring is divided into 116 arc segments. A segment is filled with the service color (opacity 0.85) if the station has that service, otherwise it is filled with the background color (`#0a1220`, near-invisible).

Thin ring separators: 0.5px strokes at `#1a2a45`.

### Station labels

- Font: `'Helvetica Neue', sans-serif`, 6–8px, weight 300
- Color: `#6a94b0` (resting), `#c9d8e8` (hovered)
- Text rotated to follow the spoke direction
- Labels on the left half (deg 180–360) are flipped 180° so text always reads left-to-right
- `text-anchor`: `start` for right half, `end` for left half

### Group markers

- Thin arc (2.5px wide) just outside the ring zone, colored by group transit color
- Small group label above the arc at the group midpoint, 7px, letter-spaced, `#4a7fa8`
- Labels: `S-BAHN`, `U-BAHN`, `TRAM`, `BUS`

### Center circle

- Fill: `#0a1220`
- Stroke: `#1a2a45`, 1px
- Content: city name (`MÜNCHEN`, 7px, `#4a7fa8`, tracked) + `Mobilitätspunkte` (two lines, 9px, `#c9d8e8`, semibold)

### Background

- Dark navy: `#0f1b2d`
- Optional: 20–30 scattered white dots (r: 0.8–1.5px, opacity 0.2–0.5) for the star-field effect from the reference image

---

## 4. Interactivity

### Hover — station label

- Hovered station's ring segments: opacity 1.0, stroke highlight `#ffffff` 0.5px
- All other stations' segments: opacity 0.08 (near-invisible)
- Hovered label: color `#c9d8e8`
- Tooltip appears (see §5)

### Hover — service ring

- All segments in that ring where service = Ja: opacity 1.0
- All segments in that ring where service = Nein: opacity 0.05
- Ring label appears in center circle instead of title
- All station labels: opacity 0.3

### Default (no hover)

- Full poster mode: all segments at opacity 0.85, all labels at `#6a94b0`
- No UI chrome visible except the legend (see §6)

### Transitions

- D3 transitions, 150ms ease-out for opacity changes
- No layout transitions (static positions)

---

## 5. Tooltip

Absolutely positioned `<div>`, not SVG. Appears at mouse position with 12px offset.

Content:
```
[Station name — large]
[Address — small, muted]
────────────────────
● S-Bahn   ● U-Bahn
● Carsharing  ● Bikesharing
[only active services shown as colored dots + label]
────────────────────
Carsharing spots: 6
```

Style: dark navy bg `#0a1220`, border `#1a2a45`, border-radius 6px, padding 12px, max-width 220px.

---

## 6. Legend

- Compact horizontal strip, bottom-center of the page
- 11 colored dots + labels, 11px font
- Visible at all times (low opacity in poster mode, full opacity on any hover)
- Section header: `SERVICE RINGS (inner → outer)`, 10px, letter-spaced, `#4a7fa8`

---

## 7. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Vite + React 18 |
| Visualization | D3 v7 (math only — scales, arc generator) |
| Rendering | React JSX for all SVG elements |
| Styling | Plain CSS (no Tailwind — SVG-heavy, no utility classes needed) |
| Data loading | `import csvUrl from './data/mobilitaetspunkte.csv?url'` + `fetch` + `papaparse` |
| Deploy | Vercel (static, `vercel.json` with `framework: null`) |

D3 is used only for computation: `d3.scaleLinear`, `d3.arc`, angle math. No `d3.select()` DOM manipulation.

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
│   │   ├── parseData.ts       # CSV → Station[], dominant group logic
│   │   ├── layout.ts          # angular positions, arc path math, label flip logic
│   │   └── colors.ts          # service color palette + group colors
│   ├── hooks/
│   │   └── useRadialLayout.ts # memoized layout computation from parsed data
│   └── components/
│       ├── RadialViz.tsx      # SVG root, wires layout → child components
│       ├── ServiceRings.tsx   # 11 rings × 116 arc segments
│       ├── StationLabels.tsx  # 116 text spokes
│       ├── GroupMarkers.tsx   # thin colored arcs + group name labels
│       ├── CenterLabel.tsx    # title in center circle
│       ├── Tooltip.tsx        # absolute div tooltip
│       └── Legend.tsx         # bottom legend strip
├── public/
├── index.html
├── vite.config.ts
├── vercel.json
├── package.json
└── tsconfig.json
```

---

## 9. Responsive Behavior

- SVG fills the viewport (`width: 100vw`, `height: 100vh`)
- All radii computed as percentages of `Math.min(width, height) / 2`
- Font sizes scale proportionally (base: `minDim * 0.008`)
- Minimum supported viewport: 480px wide

---

## 10. Out of Scope

- Geographic map view
- Filtering UI (hover-based discovery is sufficient)
- Animation on load
- Mobile touch events (desktop-first)
