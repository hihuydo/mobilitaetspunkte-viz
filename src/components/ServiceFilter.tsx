// src/components/ServiceFilter.tsx
import { useState, useEffect, useRef } from 'react'
import { X, ChevronDown, ChevronUp } from 'lucide-react'
import { SERVICE_DEFINITIONS, SERVICE_HEX } from '../lib/colors'

/* ── Group chips ────────────────────────────────────────────────── */

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
  groupCounts?: Record<string, number>
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
  groupCounts,
}: ServiceFilterProps) {
  const [showServices, setShowServices] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showServices) return
    const onMouseDown = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowServices(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [showServices])

  return (
    <div
      className="flex items-center gap-2 px-3 md:px-5 py-1.5 flex-shrink-0 border-b overflow-x-auto flex-nowrap"
      style={{ background: 'var(--map-surface)', borderColor: 'var(--map-border)' }}
    >
      {/* ── Group label ─────────────────────────────────────────── */}
      <span
        className="text-[9px] uppercase tracking-widest whitespace-nowrap"
        style={{ color: 'var(--map-text-dim)' }}
      >
        Gruppe
      </span>

      {/* ── Group chips ─────────────────────────────────────────── */}
      <div className="flex items-center gap-1">
        {GROUP_CHIPS.map((chip) => {
          const isActive = activeGroupKeys.has(chip.key)
          const noneActive = activeGroupKeys.size === 0
          const count = groupCounts?.[chip.key] ?? 0

          const style = isActive
            ? { background: chip.bgColor, color: chip.color, borderColor: chip.borderColor }
            : noneActive
              ? { background: 'transparent', color: 'var(--map-text-muted)', borderColor: 'var(--map-border)' }
              : { background: 'transparent', color: 'var(--map-text-dim)', borderColor: 'var(--map-border)', opacity: 0.5 }

          return (
            <button
              key={chip.key}
              onClick={() => onToggleGroup(chip.key)}
              className="flex items-center gap-1 text-[10px] tracking-wide px-2.5 py-0.5 rounded-full border whitespace-nowrap transition-colors"
              style={style}
            >
              {chip.label}
              {groupCounts && (
                <span className="text-[9px] opacity-60">({count})</span>
              )}
            </button>
          )
        })}
      </div>

      {/* ── Separator ───────────────────────────────────────────── */}
      <div className="w-px h-4 flex-shrink-0" style={{ background: 'var(--map-border)' }} />

      {/* ── Dienste dropdown toggle ──────────────────────────────── */}
      <div className="relative flex-shrink-0" ref={dropdownRef}>
        <button
          onClick={() => setShowServices((v) => !v)}
          className="flex items-center gap-1 text-[10px] tracking-wide px-2.5 py-0.5 rounded-full border whitespace-nowrap transition-colors"
          style={
            activeServices.size > 0
              ? { background: '#ffffff10', color: 'var(--map-text-primary)', borderColor: 'var(--map-border)' }
              : { background: 'transparent', color: 'var(--map-text-muted)', borderColor: 'var(--map-border)' }
          }
        >
          <span className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--map-text-dim)' }}>
            Dienste
          </span>
          {activeServices.size > 0 && (
            <span
              className="flex items-center justify-center w-4 h-4 rounded-full text-[9px] font-bold"
              style={{ background: '#ffffff20', color: 'var(--map-text-primary)' }}
            >
              {activeServices.size}
            </span>
          )}
          {showServices ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
        </button>

        {/* ── Service chip dropdown ───────────────────────────────── */}
        {showServices && (
          <div
            className="absolute top-full left-0 mt-1 z-50 p-2 rounded-lg border flex flex-wrap gap-1"
            style={{
              background: 'var(--map-surface)',
              borderColor: 'var(--map-border)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              minWidth: 280,
            }}
          >
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
        )}
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
