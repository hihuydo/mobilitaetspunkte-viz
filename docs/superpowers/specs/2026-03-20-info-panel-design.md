# Info Panel — Design Spec
**Date:** 2026-03-20
**Status:** Approved

---

## 1. Goal

Add a floating info panel to the existing radial visualization that explains how to read the chart and how to interact with it. The panel is written in German, matches the visual style of the existing tooltip, and can be permanently dismissed via a close button.

---

## 2. Placement & Layout

- **Position:** `position: absolute`, top-left corner of the SVG container div (`top: 16px; left: 16px`)
- The SVG container div already has `position: relative; overflow: hidden` — no layout changes needed
- The panel floats over the visualization, does not affect the flex layout or SVG dimensions
- **Width:** 220px
- **z-index:** 10 (above SVG, below tooltip)

---

## 3. Visual Style

Consistent with the existing `Tooltip` component style:

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
- Color: `#4a7fa8`, font-size: `14px`
- On click: panel disappears permanently (no re-opening in current session)

### Title
- Text: `So liest du diese Grafik`
- Font: `10px`, weight `600`, color `#c9d8e8`, letter-spacing `0.5px`
- Margin-bottom: `10px`

### Section 1 — "Was du siehst"
- Section label: `WAS DU SIEHST` — `8.5px`, `#4a7fa8`, `letter-spacing: 1px`, uppercase
- Body text (`8.5px`, `#6a94b0`, `line-height: 1.55`):

> 116 Münchner **Mobilitätspunkte** — Orte, an denen verschiedene Verkehrsmittel gebündelt sind. Jeder Strich steht für eine Station.
>
> Die **11 konzentrischen Ringe** zeigen, welche Dienste vorhanden sind: von S-Bahn (innen) bis Fahrradpumpe (außen).
>
> Die Stationen sind in vier Gruppen gegliedert: **S-Bahn, U-Bahn, Tram und Bus** — je nach ihrem wichtigsten ÖPNV-Anschluss.

Bold words rendered in `#8ab4d4`.

### Section 2 — "Wie erkunden"
- Section label: `WIE ERKUNDEN` — same style as section 1 label
- Body text (`8.5px`, `#6a94b0`, `line-height: 1.6`):

> **↗ Strich hovern** — Details zur Station: Adresse, alle vorhandenen Dienste, Anzahl Carsharing-Plätze.
> **↗ Legende hovern** — Alle Stationen mit diesem Dienst hervorheben; Zentrum zeigt den Dienstnamen.

`↗ Strich hovern` / `↗ Legende hovern` rendered in `#8ab4d4`.

---

## 5. Dismiss Behavior

- State: `infoPanelVisible: boolean`, initialized to `true`, lives in `App`
- Clicking `×` sets it to `false` — panel unmounts
- No persistence (localStorage etc.) — panel reappears on page refresh
- No re-open mechanism needed (out of scope)

---

## 6. Component

New file: `src/components/InfoPanel.tsx`

**Props:**
```typescript
interface InfoPanelProps {
  onClose: () => void
}
```

Rendered as an absolutely-positioned `<div>` inside the SVG container div in `App.tsx`. Conditionally rendered: `{infoPanelVisible && <InfoPanel onClose={() => setInfoPanelVisible(false)} />}`.

---

## 7. File Changes

| File | Change |
|---|---|
| `src/components/InfoPanel.tsx` | New component |
| `src/App.tsx` | Add `infoPanelVisible` state, render `<InfoPanel>` inside SVG container div |

No CSS file changes needed — all styles inline (consistent with other components).

---

## 8. Out of Scope

- Persisting dismissed state across sessions (no localStorage)
- Re-open button or toggle
- Animations / transitions on open/close
- Mobile / touch adaptations
