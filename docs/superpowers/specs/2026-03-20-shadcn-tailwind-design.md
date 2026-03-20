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

`vite.config.ts` — add plugin:
```ts
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

`src/index.css` (rename from `App.css` if needed, or create):
```css
@import "tailwindcss";
```

No `tailwind.config.js` needed with v4 — configuration is CSS-first.

### shadcn init

Run: `pnpm dlx shadcn@latest init`
- Style: **zinc**
- Base color: **zinc**
- Dark mode: **class** strategy (add `dark` class to `<html>`)

This generates:
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
- `components.json` — shadcn config
- CSS variables injected into `src/index.css`

`main.tsx` must add `dark` class to `<html>`:
```tsx
document.documentElement.classList.add('dark')
```

### shadcn Components to Install

```bash
pnpm dlx shadcn@latest add button card input separator
```

Components added to `src/components/ui/`:
- `button.tsx`
- `card.tsx`
- `input.tsx`
- `separator.tsx`

---

## Global Layout

`App.tsx` root div:
- Remove `background: '#0f1b2d'` — replaced by `bg-background` (shadcn dark zinc CSS variable)
- Remove `display: 'flex'`, `flexDirection: 'row'`, `height: '100vh'` — replaced with `flex flex-row h-screen`

---

## Component Changes

### `App.tsx`

- Root div: `className="flex flex-row h-screen bg-background"`
- SVG container div: `className="flex-1 relative overflow-hidden"`
- Loading div: `className="absolute inset-0 flex items-center justify-center text-sm"` + Tailwind color class
- ℹ re-open button: replace raw `<button>` with shadcn `<Button variant="outline" size="icon">` + lucide `<Info>` icon. Position: `className="absolute top-4 left-4 z-10"`

### `InfoPanel.tsx`

Outer wrapper: `position: absolute`, `top: 16`, `left: 16`, `width: 280`, `maxHeight: calc(100% - 32px)`, `overflowY: auto`, `zIndex: 10` — keep as inline style OR use `className="absolute top-4 left-4 w-[280px] max-h-[calc(100%-32px)] overflow-y-auto z-10"`.

Outer shell: replace raw `<div>` with shadcn `<Card>` — gets `bg-card border border-border rounded-lg shadow-lg backdrop-blur-sm` automatically.

Sticky header: replace with `<CardHeader>` inside a sticky `<div className="sticky top-0 bg-card/95 border-b border-border px-5 py-4 z-10">`.
- Title `<CardTitle>` or plain `<div className="text-base font-semibold text-foreground tracking-wide pr-5">`
- Close button: shadcn `<Button variant="ghost" size="icon" className="absolute top-2 right-2">` + lucide `<X size={16} />`

Body: `<CardContent className="px-5 py-4 space-y-5">`.

Section label (e.g. "WAS DU SIEHST"):
```tsx
<div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
```

Body paragraph:
```tsx
<p className="text-sm text-muted-foreground leading-relaxed">
```

Highlighted inline text (station names, ring count):
```tsx
<span className="text-foreground font-semibold">
```

### `SearchBar.tsx`

Input: replace raw `<input>` with shadcn `<Input>` — gets border, focus ring, background from shadcn automatically.
- `className="w-full"` (Input is full-width by default)
- Placeholder text color handled by CSS variables

Clear button: `<Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6">` + lucide `<X size={12} />`

Wrapper div: `className="relative"`

"Meinst du?" suggestion container: `className="mt-2 space-y-1"`

Each suggestion: `<Button variant="ghost" className="w-full justify-start text-sm text-muted-foreground h-auto py-1 px-2">`
- Prefix "Meinst du: " in `text-muted-foreground`, station name in `text-foreground font-medium`

### `Sidebar.tsx`

Remove all inline styles. Replace with Tailwind:
```tsx
<div className="w-[220px] shrink-0 h-full bg-card border-l border-border/10 p-4 flex flex-col overflow-y-auto">
```

Label above legend ("SERVICE RINGS (inner → outer)"):
```tsx
<div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-2.5">
```

Between SearchBar and legend label: shadcn `<Separator className="my-4" />`

### `Tooltip.tsx`

The tooltip is a mouse-tracking floating element (not a Radix Tooltip). Replace inline styles with Tailwind:
```tsx
<div
  className="fixed z-50 pointer-events-none bg-popover border border-border rounded-md shadow-lg px-3 py-2 text-sm text-popover-foreground max-w-[220px]"
  style={{ left: x + offset, top: y + offset }}  // keep position as inline style
>
```
Station name: `className="font-semibold text-foreground mb-1"`
Service tags: `className="text-xs text-muted-foreground"`

### `Legend.tsx`

Container: `className="flex flex-col gap-1.5"` (replaces inline flex column styles).

Each legend item (hover target):
```tsx
<div
  className="flex items-center gap-2 cursor-pointer py-0.5"
  onMouseEnter={...}
  onMouseLeave={...}
>
```
Color swatch (small circle/dot): `className="w-2 h-2 rounded-full shrink-0"` with `style={{ background: svc.color }}` (data color — keep as inline).
Label text: `className="text-xs text-muted-foreground"` — opacity animation kept via inline style or Tailwind `opacity-50 hover:opacity-100 transition-opacity`.

`containerOpacity` fade (0.5 → 1.0 on hover): keep as Tailwind `transition-opacity duration-150` with dynamic `opacity-50` / `opacity-100` class.

---

## What Does NOT Change

- `ServiceRings.tsx` — all SVG, no inline styles on non-SVG elements
- `StationLabels.tsx` — all SVG
- `RadialViz.tsx` — SVG wrapper
- `CenterLabel.tsx` — SVG
- `GroupMarkers.tsx` — SVG
- Arc colors in `src/lib/colors.ts` — data visualization palette, untouched
- All hover logic, opacity priority ladder, search logic, connector lines
- `src/lib/levenshtein.ts` — untouched
- `src/lib/layout.ts` — untouched

---

## File Summary

| File | Change |
|---|---|
| `vite.config.ts` | Add `@tailwindcss/vite` plugin |
| `src/index.css` | Add `@import "tailwindcss"` + shadcn CSS variables |
| `src/main.tsx` | Add `dark` class to `<html>` |
| `src/lib/utils.ts` | New — shadcn `cn()` helper |
| `src/components/ui/` | New — `button.tsx`, `card.tsx`, `input.tsx`, `separator.tsx` |
| `src/App.tsx` | Tailwind root layout, shadcn `Button` for ℹ |
| `src/components/InfoPanel.tsx` | shadcn `Card` shell, Tailwind body |
| `src/components/SearchBar.tsx` | shadcn `Input` + `Button` |
| `src/components/Sidebar.tsx` | Tailwind layout + shadcn `Separator` |
| `src/components/Tooltip.tsx` | Tailwind classes, position stays inline |
| `src/components/Legend.tsx` | Tailwind classes, swatch color stays inline |

---

## Success Criteria

1. App renders with shadcn dark zinc theme — no white flash, no unstyled flash
2. `InfoPanel` uses `Card` with sticky header and scrollable body — behavior identical to before
3. `SearchBar` input has shadcn focus ring and styling; search + fuzzy suggestion logic unchanged
4. Sidebar `Separator` renders correctly between search and legend
5. ℹ button uses shadcn `Button` with lucide icon
6. Tooltip floats correctly at mouse position, styled with shadcn tokens
7. Legend hover opacity transition works
8. All existing tests pass (search logic, layout, colors — no component tests need updating)
9. `pnpm build` produces no TypeScript errors
