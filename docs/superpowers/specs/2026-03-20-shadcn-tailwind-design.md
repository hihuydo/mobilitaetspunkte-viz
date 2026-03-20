# Spec: shadcn/ui + Tailwind CSS UI Chrome Migration
Date: 2026-03-20
Status: Approved by user

---

## Overview

Replace all hand-rolled inline styles on non-SVG UI chrome components with Tailwind CSS v4 utility classes and shadcn/ui components. The radial SVG visualization and its arc/ring colors are untouched. All existing behavior (hover, search, opacity priority ladder, connector lines, ring hover, station hover) is preserved exactly.

---

## Tech Stack Changes

- Add **Tailwind CSS v4** (Vite plugin: `@tailwindcss/vite`)
- Add **shadcn/ui** via CLI (`shadcn init`) — zinc dark preset
- Add **Radix UI** primitives (pulled in by shadcn components automatically)
- Add **class-variance-authority**, **clsx**, **tailwind-merge** (shadcn deps)
- Add **lucide-react** for icons (× close, ℹ)

No changes to: `d3`, `papaparse`, `vitest`, `vite`, `typescript`.

---

## Tailwind / shadcn Setup

### Tailwind v4 (Vite)

Install: `pnpm add -D @tailwindcss/vite`

`vite.config.ts` imports from `vitest/config` (which re-exports `vite/config`). The Tailwind plugin is added to the existing plugins array — this works correctly with `vitest/config`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
  },
})
```

**Do NOT split into separate `vite.config.ts` + `vitest.config.ts`** — the single file already works.

### App.css → index.css migration

`src/App.css` must be migrated. It contains:
1. `html, body, #root { background: #0f1b2d; color: #c9d8e8; overflow: hidden; }` — hardcoded colors will override shadcn's CSS variables and break the theme. These must be removed.
2. `overflow: hidden` on `html, body, #root` — **load-bearing**: prevents page scroll on the full-viewport visualization. Must be preserved.
3. `*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }` — keep.
4. `svg text { -webkit-font-smoothing: antialiased; }` — keep.
5. `.arc-path { transition: opacity 150ms ease-out; }` — keep.

**Action:** Rename `src/App.css` → `src/index.css`. Replace contents with:

```css
@import "tailwindcss";

/* shadcn CSS variables are injected here by `shadcn init` */

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body, #root {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

svg text {
  -webkit-font-smoothing: antialiased;
}

.arc-path {
  transition: opacity 150ms ease-out;
}
```

Update `src/main.tsx` to import `'./index.css'` instead of `'./App.css'`.

**Note:** `tsconfig.app.json` already has `"noUncheckedSideEffectImports": false` — the CSS import works without changes.

### Dark mode

`main.tsx` must add `dark` class to `<html>` so shadcn's dark CSS variables activate:
```tsx
document.documentElement.classList.add('dark')
```

### Order of operations (critical)

Execute setup steps in this exact order:
1. Rename `src/App.css` → `src/index.css`, update `main.tsx` import
2. Update `package.json` `pnpm.onlyBuiltDependencies`, run `pnpm install`
3. `pnpm add -D @tailwindcss/vite`, update `vite.config.ts`
4. `pnpm dlx shadcn@latest init` — will prompt for CSS file path, answer `src/index.css`
5. `pnpm dlx shadcn@latest add button card input separator`
6. `pnpm add lucide-react`

### shadcn init

Run: `pnpm dlx shadcn@latest init`
- Style: **zinc**
- Base color: **zinc**
- Dark mode: **class** strategy
- CSS file: **`src/index.css`** (answer this when prompted — must be renamed first)

This generates:
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
- `components.json` — shadcn config
- CSS variables appended to `src/index.css` inside `@layer base` with `:root` and `.dark` selectors
- `@layer base { body { @apply bg-background text-foreground; } }` — this sets global text color and background via CSS variables, replacing the removed hardcoded `color: #c9d8e8` from `App.css`. shadcn init handles this automatically.

**Font family:** shadcn's `@layer base` does not explicitly set `font-family` on `body`. Add to `src/index.css` after `@import "tailwindcss"`:
```css
@layer base {
  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }
}
```
SVG `<text>` elements in this project set `fontFamily` via SVG attributes — they are unaffected.

### Custom design tokens

No hardcoded color, font-size, or spacing values anywhere in the UI chrome. All values must use:
- **Tailwind utility classes** for static styling (font sizes, spacing, colors that map to shadcn tokens)
- **CSS custom properties** for state-driven inline styles where Tailwind classes cannot be used

The Legend component has three state-driven label colors that don't map to shadcn's default token set. Define them as CSS custom properties in `src/index.css` inside `@layer base`:

```css
@layer base {
  :root {
    /* Legend label colors — used for state-driven inline styles in Legend.tsx */
    --color-legend-label: 210 55% 70%;          /* default: medium blue */
    --color-legend-label-active: 210 30% 88%;   /* hovered: light blue-grey */
  }
}
```

These are defined in HSL component form (no `hsl()` wrapper) so they compose with opacity using `hsl(var(--color-legend-label) / 0.4)`.

In `tailwind.config` (or via CSS `@theme` in v4), extend the color palette to expose these as Tailwind classes too:
```css
@theme {
  --color-legend-label: hsl(210 55% 70%);
  --color-legend-label-active: hsl(210 30% 88%);
}
```

This enables `text-legend-label` and `text-legend-label-active` as Tailwind classes for static uses.

**Exception — visualization data colors:** `svc.color` values on Legend dots (`style={{ background: svc.color }}`) are data-encoding colors from `src/lib/colors.ts`. These represent transit service types and are intentionally not design tokens — do not change them.

### lucide-react

`pnpm add lucide-react` (step 6 above). Do not rely on shadcn to install it implicitly.

### shadcn Components to Install

```bash
pnpm dlx shadcn@latest add button card input separator
```

Components added to `src/components/ui/`:
- `button.tsx`
- `card.tsx`
- `input.tsx`
- `separator.tsx`

### pnpm onlyBuiltDependencies

`@tailwindcss/vite` uses `lightningcss` which has a native binary. Add it to `package.json`:
```json
"pnpm": {
  "onlyBuiltDependencies": ["esbuild", "lightningcss"]
}
```
Run `pnpm install` after updating this.

---

## Global Layout

`App.tsx` root div: replace all inline styles with `className="flex flex-row h-screen bg-background"`.

SVG container div (flex:1): `className="flex-1 relative overflow-hidden"`.

Loading div: `className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground"`.

---

## Component Changes

### `App.tsx`

- Root div: `className="flex flex-row h-screen bg-background"`
- SVG container div: `className="flex-1 relative overflow-hidden"`
- Loading div: `className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground"`
- ℹ re-open button: replace raw `<button>` with shadcn `<Button variant="outline" size="icon" className="absolute top-4 left-4 z-10">` + lucide `<Info size={18} />`

### `InfoPanel.tsx`

**Component tree structure** (critical for sticky header + scroll to work correctly):

```
<Card className="absolute top-4 left-4 w-[280px] max-h-[calc(100%-32px)] overflow-y-auto z-10 backdrop-blur-sm">
  {/* Sticky header — direct child of Card, before CardContent */}
  <div className="sticky top-0 bg-card/95 border-b border-border px-5 py-4 z-10">
    <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={onClose}>
      <X size={16} />
    </Button>
    <div className="text-base font-semibold text-foreground tracking-wide pr-5">
      So liest du diese Grafik
    </div>
  </div>
  {/* Scrollable body */}
  <CardContent className="px-5 py-4 space-y-5">
    ...
  </CardContent>
</Card>
```

The `overflow-y-auto` and `max-h-[calc(100%-32px)]` are on the `<Card>` itself (the outermost element), NOT on `CardContent`. This is required so the sticky header stays fixed while the body scrolls.

Section label ("WAS DU SIEHST"):
```tsx
<div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
```

Body paragraph:
```tsx
<p className="text-sm text-muted-foreground leading-relaxed">
```

Highlighted inline text:
```tsx
<span className="text-foreground font-semibold">
```

× close button arrow color: lucide `<X>` inherits `text-muted-foreground` from `Button variant="ghost"`.

### `SearchBar.tsx`

Wrapper div: `className="relative"`

Input: replace raw `<input>` with shadcn `<Input className="w-full pr-8" placeholder="Station suchen…" />`

Clear button (appears when `inputValue` non-empty):
```tsx
<Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6" onClick={...}>
  <X size={12} />
</Button>
```

"Meinst du?" suggestion container: `className="mt-2 space-y-1"`

Each suggestion (trailing `?` is preserved — do not drop it):
```tsx
<Button variant="ghost" className="w-full justify-start text-sm h-auto py-1 px-2">
  <span className="text-muted-foreground">Meinst du: </span>
  <span className="text-foreground font-medium ml-1">{station.name}</span>
  <span className="text-muted-foreground">?</span>
</Button>
```

All search/fuzzy logic (Levenshtein, guarded useEffect, phase 1/2 search) is unchanged.

### `Sidebar.tsx`

```tsx
<div className="w-[220px] shrink-0 h-full bg-card border-l border-border/10 p-4 flex flex-col overflow-y-auto">
  <SearchBar ... />
  <Separator className="my-4" />
  <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2.5">
    SERVICE RINGS (inner → outer)
  </div>
  <Legend ... />
</div>
```

### `Tooltip.tsx`

The tooltip is a mouse-tracking floating element rendered via `createPortal` to `document.body`. It is NOT replaced with the Radix `Tooltip` primitive.

Position stays as inline style (dynamic values). Classes replace styling:
```tsx
<div
  className="fixed z-50 pointer-events-none bg-popover border border-border rounded-md shadow-lg px-3 py-2 text-sm text-popover-foreground max-w-[220px]"
  style={{ left: mouseX + offset, top: mouseY + offset }}
>
```

**Note:** `z-50` (z-index: 50) replaces the previous `zIndex: 1000`. This is intentional — InfoPanel is `z-10`, so z-50 is sufficient for the portal tooltip to render above all chrome.

Station name: `className="font-semibold text-foreground mb-1"`
Service list: `className="text-xs text-muted-foreground"`

### `Legend.tsx`

**Legend has complex state-driven opacity and color logic that CANNOT use static Tailwind pseudo-classes.** The `containerOpacity`, `labelColor`, and dot opacity are all driven by React state (`hoveredRingIndex`, `isStationHover`). These values stay as inline styles.

State-driven opacity values stay as inline styles; state-driven colors reference CSS custom properties (no hex literals). Layout moves to Tailwind:

```tsx
// Derive containerOpacity from state — numeric opacity is acceptable as a literal (semantic: 50% / 100%)
const containerOpacity = isRingHover || isStationHover ? 1 : 0.5

// Derive labelColor using CSS custom properties — no hex literals
const labelColor = isHovered
  ? 'hsl(var(--color-legend-label-active))'
  : isRingHover
  ? 'hsl(var(--color-legend-label) / 0.4)'
  : 'hsl(var(--color-legend-label))'
```

Outer container:
```tsx
<div
  className="flex flex-col gap-1 transition-opacity duration-150"
  style={{ opacity: containerOpacity }}
>
```

Inner items wrapper:
```tsx
<div className="flex flex-col gap-2">
```

Each item row:
```tsx
<div className="flex items-center gap-1.5 cursor-pointer" onMouseEnter={...} onMouseLeave={...}>
```

Color dot — `svc.color` is a data-encoding color from `colors.ts`, not a design token; keep as-is:
```tsx
<div
  className="w-2.5 h-2.5 rounded-full shrink-0 transition-opacity duration-150"
  style={{ background: svc.color, opacity: isRingHover && !isHovered ? 0.4 : 1 }}
/>
```

Label — `labelColor` now references CSS variables, no hex literals:
```tsx
<span
  className="text-xs select-none transition-colors duration-150"
  style={{ color: labelColor }}
>
  {svc.label}
</span>
```

---

## Out of Scope

- `App.tsx` error state (`if (error) return ...`) — the inline styles on the error branch are left as-is. This is a dev-only error boundary, not user-facing chrome.

---

## What Does NOT Change

- `ServiceRings.tsx` — SVG only
- `StationLabels.tsx` — SVG only
- `RadialViz.tsx` — SVG wrapper
- `CenterLabel.tsx` — SVG only
- `GroupMarkers.tsx` — SVG only
- `ConnectorLines.tsx` — SVG only
- Arc colors in `src/lib/colors.ts` — data viz palette, untouched
- All hover logic, opacity priority ladder, search logic, connector lines
- `src/lib/levenshtein.ts` — untouched
- `src/lib/layout.ts` — untouched

---

## File Summary

| File | Change |
|---|---|
| `vite.config.ts` | Add `@tailwindcss/vite` plugin |
| `src/App.css` → `src/index.css` | Rename; strip hardcoded colors; add `@import "tailwindcss"` + shadcn CSS variables + custom `--color-legend-label*` tokens + `@theme` block |
| `src/main.tsx` | Update CSS import path; add `dark` class to `<html>` |
| `package.json` | Add `lightningcss` to `pnpm.onlyBuiltDependencies` |
| `src/lib/utils.ts` | New — shadcn `cn()` helper |
| `src/components/ui/` | New — `button.tsx`, `card.tsx`, `input.tsx`, `separator.tsx` |
| `src/App.tsx` | Tailwind classes, shadcn `Button` for ℹ |
| `src/components/InfoPanel.tsx` | shadcn `Card` with sticky header in correct tree position |
| `src/components/SearchBar.tsx` | shadcn `Input` + `Button` |
| `src/components/Sidebar.tsx` | Tailwind layout + shadcn `Separator` |
| `src/components/Tooltip.tsx` | Tailwind classes, position inline |
| `src/components/Legend.tsx` | Tailwind layout classes; state-driven colors/opacity stay inline |

---

## Success Criteria

1. App renders with shadcn dark zinc theme — no white flash, no blue `#0f1b2d` background
2. Page does not scroll — `overflow: hidden` on `html/body/#root` preserved
3. `InfoPanel` sticky header stays fixed while body scrolls
4. `SearchBar` input has shadcn focus ring; search + fuzzy suggestion logic unchanged
5. Sidebar `Separator` renders between search and legend
6. ℹ button uses shadcn `Button` with lucide `<Info>` icon
7. Tooltip floats at mouse position, styled with shadcn tokens, above InfoPanel
8. Legend hover opacity/color transitions work (state-driven inline styles)
9. All existing tests pass (`pnpm test`)
10. `pnpm build` produces no TypeScript errors
11. No hardcoded color hex/rgba values in any UI chrome component — only Tailwind tokens or `hsl(var(--...))` CSS variable references. Exception: `svc.color` dots in Legend (data-encoding colors from `colors.ts`)
