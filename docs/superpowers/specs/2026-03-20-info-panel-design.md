# Info Panel — Design Spec
**Date:** 2026-03-20
**Status:** Approved

---

## 1. Goal

Add a floating info panel to the existing radial visualization that explains how to read the chart and how to interact with it. The panel is written in German, uses a similar visual language to the existing tooltip, and can be permanently dismissed via a close button.

---

## 2. Placement & Layout

- **Position:** `position: absolute`, top-left corner of the SVG container div (`top: 16px; left: 16px`)
- The SVG container div already has `position: relative; overflow: hidden` — the panel is placed inside it as a sibling to the viz ternary (see §6 for exact JSX structure)
- The panel stays well within the container bounds (`width: 220px`, left-anchored) so `overflow: hidden` will not clip it horizontally. To guard against tall-panel clipping on short viewports, the panel uses `maxHeight: 'calc(100% - 32px)'` and `overflowY: 'auto'`
- **Width:** 220px
- **z-index:** 10 (above SVG, below tooltip which is portaled to body)

---

## 3. Visual Style

Similar visual language to the existing `Tooltip` component (same dark palette), with intentional differences: semi-transparent background + backdrop blur (the panel persists on screen and benefits from depth separation from the viz behind it).

| Property | Value |
|---|---|
| Background | `rgba(10, 18, 32, 0.94)` |
| Border | `1px solid #1a2a45` |
| Border-radius | `8px` |
| Padding | `14px 16px` |
| Backdrop-filter | `blur(4px)` |
| Box-shadow | `0 4px 16px rgba(0,0,0,0.5)` |
| Font family | `'Helvetica Neue', Helvetica, Arial, sans-serif` |

---

## 4. Content (German)

### Close button
- `×` character, `position: absolute; top: 8px; right: 10px`
- Style: `color: #4a7fa8`, `fontSize: 14px`, `cursor: pointer`, `background: none`, `border: none`, `lineHeight: 1`
- No hover state needed
- On click: panel disappears (no re-opening in current session)

### Title
- Text: `So liest du diese Grafik`
- Font: `10px`, weight `600`, color `#c9d8e8`, letter-spacing `0.5px`
- Margin-bottom: `10px`, padding-right: `16px` (to avoid overlap with × button)

### Section 1 — "Was du siehst"
- Section label: `WAS DU SIEHST` — `8.5px`, `#4a7fa8`, `letterSpacing: '1px'`, `textTransform: 'uppercase'`, margin-bottom `4px`
- Body text: `8.5px`, `#6a94b0`, `lineHeight: 1.55`, margin-bottom `10px`

Body content (3 paragraphs, each separated by `<br /><br />`):

> 116 Münchner <span #8ab4d4 bold>Mobilitätspunkte</span> — Orte, an denen verschiedene Verkehrsmittel gebündelt sind. Jeder Strich steht für eine Station.
>
> Die <span #8ab4d4 bold>11 konzentrischen Ringe</span> zeigen, welche Dienste vorhanden sind: von S-Bahn (innen) bis Fahrradpumpe (außen).
>
> Die Stationen sind in vier Gruppen gegliedert: <span #8ab4d4 bold>S-Bahn, U-Bahn, Tram und Bus</span> — je nach ihrem wichtigsten ÖPNV-Anschluss.

**Bold/colored text implementation:** Hardcode with `<span style={{ color: '#8ab4d4', fontWeight: 600 }}>` — no markdown parser needed.

### Section 2 — "Wie erkunden"
- Section label: `WIE ERKUNDEN` — same style as section 1 label
- Body text: `8.5px`, `#6a94b0`, `lineHeight: 1.6`

Body content (2 lines):

> <span #8ab4d4>↗ Strich hovern</span> — Details zur Station: Adresse, alle vorhandenen Dienste, Anzahl Carsharing-Plätze.<br />
> <span #8ab4d4>↗ Legende hovern</span> — Alle Stationen mit diesem Dienst hervorheben; Zentrum zeigt den Dienstnamen.

`↗ Strich hovern` / `↗ Legende hovern` rendered as `<span style={{ color: '#8ab4d4' }}>`.

---

## 5. Dismiss Behavior

- State: `infoPanelVisible: boolean`, initialized to `true`, lives in `App`
- Clicking `×` sets it to `false` — panel unmounts
- No persistence (localStorage etc.) — panel reappears on page refresh
- No re-open mechanism needed (out of scope)

---

## 6. Component & Integration

New file: `src/components/InfoPanel.tsx`

**Props:**
```typescript
interface InfoPanelProps {
  onClose: () => void
}
```

All styles inline (no CSS file). The component is a single `<div>` with `position: 'absolute'`.

**Exact placement in `App.tsx`** — the panel is a sibling to the viz ternary, rendered after it (higher in z-order), so it is visible during both loading and viz states:

```tsx
<div ref={svgContainerRef} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
  {layout && svgDimensions.width > 0 && svgDimensions.height > 0 ? (
    <RadialViz ... />
  ) : (
    <LoadingPlaceholder />
  )}
  {infoPanelVisible && <InfoPanel onClose={() => setInfoPanelVisible(false)} />}
</div>
```

---

## 7. File Changes

| File | Change |
|---|---|
| `src/components/InfoPanel.tsx` | New component |
| `src/App.tsx` | Add `infoPanelVisible` state + render `<InfoPanel>` as sibling to viz ternary |

No CSS file changes — all styles inline.

---

## 8. Out of Scope

- Persisting dismissed state across sessions (no localStorage)
- Re-open button or toggle
- Animations / transitions on open/close
- Mobile / touch adaptations
