// src/components/FilterChips.tsx

interface Chip {
  key: string
  label: string
  color: string
  bgColor: string
  borderColor: string
}

const CHIPS: Chip[] = [
  { key: 's-bahn', label: 'S-Bahn',   color: '#00ff88', bgColor: '#00ff8818', borderColor: '#00ff8840' },
  { key: 'u-bahn', label: 'U-Bahn',   color: '#00b4ff', bgColor: '#00b4ff18', borderColor: '#00b4ff40' },
  { key: 'tram',   label: 'Tram',     color: '#ff4455', bgColor: '#ff445518', borderColor: '#ff445540' },
  { key: 'bus',    label: 'Bus',      color: '#ffd700', bgColor: '#ffd70018', borderColor: '#ffd70040' },
  { key: 'none',   label: 'Sonstige', color: '#4488aa', bgColor: '#4488aa18', borderColor: '#4488aa40' },
]

interface FilterChipsProps {
  activeKeys: Set<string>
  onToggle: (key: string) => void
}

export function FilterChips({ activeKeys, onToggle }: FilterChipsProps) {
  return (
    <div className="flex items-center gap-1.5 flex-nowrap overflow-x-auto">
      <span
        className="text-[9px] uppercase tracking-widest whitespace-nowrap"
        style={{ color: 'var(--map-text-dim)' }}
      >
        Filter
      </span>
      {CHIPS.map((chip) => {
        const isExplicitlyOn = activeKeys.has(chip.key)
        const noneActive = activeKeys.size === 0

        const style = isExplicitlyOn
          ? { background: chip.bgColor, color: chip.color, borderColor: chip.borderColor }
          : noneActive
            ? { background: 'transparent', color: 'var(--map-text-muted)', borderColor: 'var(--map-border)' }
            : { background: 'transparent', color: 'var(--map-text-dim)', borderColor: 'var(--map-border)', opacity: 0.5 }

        return (
          <button
            key={chip.key}
            onClick={() => onToggle(chip.key)}
            className="text-[10px] tracking-wide px-2.5 py-1 rounded-full border whitespace-nowrap transition-colors"
            style={style}
          >
            {chip.label}
          </button>
        )
      })}
    </div>
  )
}
