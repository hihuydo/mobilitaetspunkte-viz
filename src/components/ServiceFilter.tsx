// src/components/ServiceFilter.tsx
import { X } from 'lucide-react'
import { SERVICE_DEFINITIONS } from '../lib/colors'

/* ── Group chips (from former FilterChips.tsx) ────────────────────── */

interface GroupChip {
  key: string
  label: string
  color: string
  bgColor: string
  borderColor: string
}

const GROUP_CHIPS: GroupChip[] = [
  { key: 's-bahn', label: 'S-Bahn',   color: '#00ff88', bgColor: '#00ff8818', borderColor: '#00ff8840' },
  { key: 'u-bahn', label: 'U-Bahn',   color: '#00b4ff', bgColor: '#00b4ff18', borderColor: '#00b4ff40' },
  { key: 'tram',   label: 'Tram',     color: '#ff4455', bgColor: '#ff445518', borderColor: '#ff445540' },
  { key: 'bus',    label: 'Bus',      color: '#ffd700', bgColor: '#ffd70018', borderColor: '#ffd70040' },
  { key: 'none',   label: 'Sonstige', color: '#4488aa', bgColor: '#4488aa18', borderColor: '#4488aa40' },
]

/* ── Service chip hex colors (CSS vars don't work in inline SVG) ── */

const SERVICE_HEX: Record<string, string> = {
  s_bahn_vorhanden: '#00A651',
  u_bahn_vorhanden: '#0072BC',
  tram_vorhanden: '#CC0000',
  bus_vorhanden: '#F7941D',
  ods_vorhanden: '#9B59B6',
  gaf_ts_vorhanden: '#E91E63',
  gaf_bs_vorhanden: '#FFD600',
  gaf_ls_vorhanden: '#00BCD4',
  gaf_ms_vorhanden: '#FF8A65',
  radservicestation_vorhanden: '#80CBC4',
  radpumpe_vorhanden: '#B0BEC5',
}

/* ── Props ─────────────────────────────────────────────────────── */

interface ServiceFilterProps {
  activeGroupKeys: Set<string>
  onToggleGroup: (key: string) => void
  activeServices: Set<string>
  onToggleService: (field: string) => void
  onReset: () => void
  matchCount: number
  totalCount: number
  isFiltering: boolean
}

/* ── Component ─────────────────────────────────────────────────── */

export function ServiceFilter({
  activeGroupKeys,
  onToggleGroup,
  activeServices,
  onToggleService,
  onReset,
  matchCount,
  totalCount,
  isFiltering,
}: ServiceFilterProps) {
  return (
    <div
      className="flex items-center gap-2 px-3 md:px-5 py-1.5 flex-shrink-0 border-b overflow-x-auto flex-nowrap"
      style={{ background: 'var(--map-surface)', borderColor: 'var(--map-border)' }}
    >
      {/* ── Group chips ─────────────────────────────────────────── */}
      <span
        className="text-[9px] uppercase tracking-widest whitespace-nowrap"
        style={{ color: 'var(--map-text-dim)' }}
      >
        Gruppe
      </span>

      <div className="flex items-center gap-1">
        {GROUP_CHIPS.map((chip) => {
          const isActive = activeGroupKeys.has(chip.key)
          const noneActive = activeGroupKeys.size === 0

          const style = isActive
            ? { background: chip.bgColor, color: chip.color, borderColor: chip.borderColor }
            : noneActive
              ? { background: 'transparent', color: 'var(--map-text-muted)', borderColor: 'var(--map-border)' }
              : { background: 'transparent', color: 'var(--map-text-dim)', borderColor: 'var(--map-border)', opacity: 0.5 }

          return (
            <button
              key={chip.key}
              onClick={() => onToggleGroup(chip.key)}
              className="text-[10px] tracking-wide px-2.5 py-0.5 rounded-full border whitespace-nowrap transition-colors"
              style={style}
            >
              {chip.label}
            </button>
          )
        })}
      </div>

      {/* ── Separator ───────────────────────────────────────────── */}
      <div className="w-px h-4 flex-shrink-0" style={{ background: 'var(--map-border)' }} />

      {/* ── Service chips ───────────────────────────────────────── */}
      <span
        className="text-[9px] uppercase tracking-widest whitespace-nowrap"
        style={{ color: 'var(--map-text-dim)' }}
      >
        Dienste
      </span>

      <div className="flex items-center gap-1 flex-nowrap">
        {SERVICE_DEFINITIONS.map((svc) => {
          const isActive = activeServices.has(svc.field)
          const hex = SERVICE_HEX[svc.field] ?? '#888'

          return (
            <button
              key={svc.field}
              onClick={() => onToggleService(svc.field)}
              className="flex items-center gap-1 text-[10px] tracking-wide px-2 py-0.5 rounded-full border whitespace-nowrap transition-all"
              style={
                isActive
                  ? { background: `${hex}18`, color: hex, borderColor: `${hex}40` }
                  : { background: 'transparent', color: 'var(--map-text-muted)', borderColor: 'var(--map-border)' }
              }
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: isActive ? hex : 'var(--map-text-dim)' }}
              />
              {svc.label}
            </button>
          )
        })}
      </div>

      {/* ── Spacer ──────────────────────────────────────────────── */}
      <div className="flex-1" />

      {/* ── Match counter + reset ───────────────────────────────── */}
      {isFiltering && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] tabular-nums" style={{ color: 'var(--map-text-muted)' }}>
            {matchCount} / {totalCount}
          </span>
          <button
            onClick={onReset}
            className="flex items-center gap-0.5 text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded border transition-colors"
            style={{ color: 'var(--map-text-dim)', borderColor: 'var(--map-border)' }}
          >
            <X size={10} />
            Reset
          </button>
        </div>
      )}
    </div>
  )
}
