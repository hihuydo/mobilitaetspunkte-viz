# Info Panel Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dismissible floating info panel (top-left overlay) that explains in German how to read and interact with the radial visualization.

**Architecture:** A single new `InfoPanel` component renders an absolutely-positioned div inside the SVG container. `App` owns a `infoPanelVisible` boolean state, passes `onClose` to the panel. All styles are inline — no CSS files. No tests needed for this component (pure JSX render, no logic to unit-test).

**Tech Stack:** Vite 5, React 18, TypeScript — same as existing project.

**Spec:** `docs/superpowers/specs/2026-03-20-info-panel-design.md`

---

## Chunk 1: InfoPanel component + App wiring

### Task 1: Create `src/components/InfoPanel.tsx`

**Files:**
- Create: `src/components/InfoPanel.tsx`

- [ ] **Step 1: Create `src/components/InfoPanel.tsx`**

```tsx
interface InfoPanelProps {
  onClose: () => void
}

export function InfoPanel({ onClose }: InfoPanelProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
        width: 220,
        maxHeight: 'calc(100% - 32px)',
        overflowY: 'auto',
        background: 'rgba(10, 18, 32, 0.94)',
        border: '1px solid #1a2a45',
        borderRadius: 8,
        padding: '14px 16px',
        backdropFilter: 'blur(4px)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        zIndex: 10,
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 8,
          right: 10,
          background: 'none',
          border: 'none',
          color: '#4a7fa8',
          fontSize: 14,
          lineHeight: 1,
          cursor: 'pointer',
          padding: 0,
        }}
      >
        ×
      </button>

      {/* Title */}
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: '#c9d8e8',
          letterSpacing: '0.5px',
          marginBottom: 10,
          paddingRight: 16,
        }}
      >
        So liest du diese Grafik
      </div>

      {/* Section 1: Was du siehst */}
      <div
        style={{
          fontSize: 8.5,
          color: '#4a7fa8',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginBottom: 4,
        }}
      >
        Was du siehst
      </div>
      <div
        style={{
          fontSize: 8.5,
          color: '#6a94b0',
          lineHeight: 1.55,
          marginBottom: 10,
        }}
      >
        116 Münchner{' '}
        <span style={{ color: '#8ab4d4', fontWeight: 600 }}>Mobilitätspunkte</span> — Orte,
        an denen verschiedene Verkehrsmittel gebündelt sind. Jeder Strich steht für eine
        Station.
        <br />
        <br />
        Die{' '}
        <span style={{ color: '#8ab4d4', fontWeight: 600 }}>11 konzentrischen Ringe</span>{' '}
        zeigen, welche Dienste vorhanden sind: von S-Bahn (innen) bis Fahrradpumpe (außen).
        <br />
        <br />
        Die Stationen sind in vier Gruppen gegliedert:{' '}
        <span style={{ color: '#8ab4d4', fontWeight: 600 }}>S-Bahn, U-Bahn, Tram und Bus</span>{' '}
        — je nach ihrem wichtigsten ÖPNV-Anschluss.
      </div>

      {/* Section 2: Wie erkunden */}
      <div
        style={{
          fontSize: 8.5,
          color: '#4a7fa8',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginBottom: 4,
        }}
      >
        Wie erkunden
      </div>
      <div style={{ fontSize: 8.5, color: '#6a94b0', lineHeight: 1.6 }}>
        <span style={{ color: '#8ab4d4' }}>↗ Strich hovern</span> — Details zur Station:
        Adresse, alle vorhandenen Dienste, Anzahl Carsharing-Plätze.
        <br />
        <span style={{ color: '#8ab4d4' }}>↗ Legende hovern</span> — Alle Stationen mit
        diesem Dienst hervorheben; Zentrum zeigt den Dienstnamen.
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "/Users/huydo/Dropbox/HIHUYDO/01 Projekte/00 Vibe Coding/daten-visualisierung/munich/mobilitaetspunkte-viz" && pnpm build 2>&1 | tail -10
```

Expected: build succeeds (InfoPanel not yet used — that's fine, TypeScript won't complain about an unused export).

---

### Task 2: Wire InfoPanel into App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add `infoPanelVisible` state and import to `App.tsx`**

Add the import at the top of `src/App.tsx` (after existing component imports):

```tsx
import { InfoPanel } from './components/InfoPanel'
```

Add state inside the `App` function body (after the existing `mousePos` state):

```tsx
const [infoPanelVisible, setInfoPanelVisible] = useState(true)
```

- [ ] **Step 2: Render `<InfoPanel>` inside the SVG container div**

In `src/App.tsx`, locate the SVG container div:

```tsx
<div ref={svgContainerRef} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
  {layout && svgDimensions.width > 0 && svgDimensions.height > 0 ? (
    ...
  ) : (
    ...
  )}
</div>
```

Add `<InfoPanel>` as a sibling **after** the ternary, still inside the same container div:

```tsx
<div ref={svgContainerRef} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
  {layout && svgDimensions.width > 0 && svgDimensions.height > 0 ? (
    <RadialViz
      layout={layout}
      groups={groups}
      width={svgDimensions.width}
      height={svgDimensions.height}
      hoveredRingIndex={hoveredRingIndex}
      hoveredStationIndex={hoveredStationIndex}
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
  {infoPanelVisible && (
    <InfoPanel onClose={() => setInfoPanelVisible(false)} />
  )}
</div>
```

- [ ] **Step 3: Run full build — must pass clean**

```bash
cd "/Users/huydo/Dropbox/HIHUYDO/01 Projekte/00 Vibe Coding/daten-visualisierung/munich/mobilitaetspunkte-viz" && pnpm build 2>&1
```

Expected: no TypeScript errors, build succeeds.

- [ ] **Step 4: Run tests — all 33 must pass**

```bash
cd "/Users/huydo/Dropbox/HIHUYDO/01 Projekte/00 Vibe Coding/daten-visualisierung/munich/mobilitaetspunkte-viz" && pnpm test 2>&1 | tail -10
```

Expected: 33 tests pass, 0 failures.

- [ ] **Step 5: Commit**

```bash
cd "/Users/huydo/Dropbox/HIHUYDO/01 Projekte/00 Vibe Coding/daten-visualisierung/munich/mobilitaetspunkte-viz"
git add src/components/InfoPanel.tsx src/App.tsx
git commit -m "feat: add dismissible info panel with German usage instructions"
```
