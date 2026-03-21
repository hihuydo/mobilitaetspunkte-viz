// src/components/ServiceFilter.tsx
import { X } from 'lucide-react'
import { SERVICE_DEFINITIONS } from '../lib/colors'

/** Hex colors for SVG-safe service chip dots (CSS vars don't work in inline SVG) */
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

interface ServiceFilterProps {
  activeServices: Set<string>
  onToggle: (field: string) => void
  onReset: () => void
  matchCount: number
  totalCount: number
}

export function ServiceFilter({
  activeServices,
  onToggle,
  onReset,
  matchCount,
  totalCount,
}: ServiceFilterProps) {
  const hasFilter = activeServices.size > 0

  return (
    <div
      className="flex items-center gap-2 px-5 py-1.5 flex-shrink-0 border-b"
      style={{ background: 'var(--map-surface)', borderColor: 'var(--map-border)' }}
    >
      <span
        className="text-[9px] uppercase tracking-widest whitespace-nowrap"
        style={{ color: 'var(--map-text-dim)' }}
      >
        Dienste
      </span>

      <div className="flex items-center gap-1 flex-wrap">
        {SERVICE_DEFINITIONS.map((svc) => {
          const isActive = activeServices.has(svc.field)
          const hex = SERVICE_HEX[svc.field] ?? '#888'

          return (
            <button
              key={svc.field}
              onClick={() => onToggle(svc.field)}
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

      {/* Spacer */}
      <div className="flex-1" />

      {/* Match counter + reset */}
      {hasFilter && (
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
