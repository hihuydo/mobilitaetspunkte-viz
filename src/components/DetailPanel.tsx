// src/components/DetailPanel.tsx
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { X } from 'lucide-react'
import { SERVICE_DEFINITIONS } from '../lib/colors'
import type { MapStation } from '../lib/mapLayout'
import { GROUP_NEON } from '../lib/mapLayout'

interface DetailPanelProps {
  station: MapStation | null
  allStations: MapStation[]
  onClose?: () => void
  onFilterService?: (field: string) => void
}

const GROUP_LABELS: Record<string, string> = {
  's-bahn': 'S-BAHN',
  'u-bahn': 'U-BAHN',
  'tram':   'TRAM',
  'bus':    'BUS',
  'none':   'SONSTIGE',
}

function avg(nums: number[]): number {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0
}

/* ── Idle overview (no station selected) ───────────────────────── */

function IdleContent({ allStations, onFilterService }: { allStations: MapStation[]; onFilterService?: (field: string) => void }) {
  const totalCount = allStations.length
  const avgServices = avg(allStations.map((s) => s.serviceCount))

  const groupOrder = ['s-bahn', 'u-bahn', 'tram', 'bus', 'none'] as const
  const groupCounts = groupOrder.map((key) => ({
    key,
    label: GROUP_LABELS[key] ?? key,
    count: allStations.filter((s) => s.groupKey === key).length,
    color: GROUP_NEON[key] ?? '#4488aa',
  }))
  const maxGroupCount = Math.max(...groupCounts.map((g) => g.count), 1)

  const serviceCounts = SERVICE_DEFINITIONS.map((svc) => ({
    ...svc,
    count: allStations.filter((s) => s.services[svc.field] === true).length,
  }))
  const sortedDesc = [...serviceCounts].sort((a, b) => b.count - a.count)
  const topServices = sortedDesc.slice(0, 3)
  const rarestServices = sortedDesc.slice(-3).reverse()
  const maxServiceCount = Math.max(...serviceCounts.map((s) => s.count), 1)

  return (
    <>
      <div className="p-[18px] pb-0">
        <h2 className="text-[21px] font-black leading-[1.15] tracking-[-0.025em]" style={{ color: 'var(--map-text-primary)' }}>
          Überblick
        </h2>
      </div>

      <Separator className="my-3.5 mx-[18px] w-auto" style={{ background: 'var(--map-border)' }} />

      <div className="px-[18px] pb-3.5">
        <p className="text-[12px] uppercase tracking-[.1em] mb-2.5" style={{ color: 'var(--map-text-muted)' }}>Gesamt</p>
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-[42px] font-black leading-none tracking-[-0.04em]" style={{ color: 'var(--map-text-primary)' }}>{totalCount}</span>
          <span className="text-[14px]" style={{ color: 'var(--map-text-muted)' }}>Stationen</span>
        </div>
        <p className="text-[13px]" style={{ color: 'var(--map-text-dim)' }}>
          Ø {avgServices.toLocaleString('de-DE', { maximumFractionDigits: 1 })} Angebote pro Station
        </p>
      </div>

      <Separator className="mx-[18px] w-auto" style={{ background: 'var(--map-border)' }} />

      <div className="px-[18px] py-4">
        <p className="text-[12px] uppercase tracking-[.1em] mb-2.5" style={{ color: 'var(--map-text-muted)' }}>Nach Anschluss</p>
        {groupCounts.map(({ key, label, count, color: gColor }) => (
          <div key={key} className="flex items-center gap-2 mb-1.5">
            <span className="text-[12px] w-[64px] flex-shrink-0" style={{ color: gColor }}>{label}</span>
            <div className="flex-1 h-1 rounded-sm" style={{ background: 'var(--map-border)' }}>
              <div className="h-1 rounded-sm" style={{ width: `${(count / maxGroupCount) * 100}%`, background: gColor }} />
            </div>
            <span className="text-[12px] w-6 text-right" style={{ color: 'var(--map-text-muted)' }}>{count}</span>
          </div>
        ))}
      </div>

      <Separator className="mx-[18px] w-auto" style={{ background: 'var(--map-border)' }} />

      <div className="px-[18px] py-4">
        <p className="text-[12px] uppercase tracking-[.1em] mb-2.5" style={{ color: 'var(--map-text-muted)' }}>Häufigste Angebote</p>
        {topServices.map(({ field, label, color: sColor, count }) => (
          <div key={field} className="flex items-center gap-2 mb-1.5">
            <span className="text-[12px] w-[80px] flex-shrink-0 truncate" style={{ color: 'var(--map-text-muted)' }}>{label}</span>
            <div className="flex-1 h-1 rounded-sm" style={{ background: 'var(--map-border)' }}>
              <div className="h-1 rounded-sm" style={{ width: `${(count / maxServiceCount) * 100}%`, background: sColor }} />
            </div>
            <span className="text-[12px] w-6 text-right tabular-nums" style={{ color: 'var(--map-text-muted)' }}>{count}</span>
            {onFilterService && (
              <button
                onClick={() => onFilterService(field)}
                className="text-[9px] px-1.5 py-0.5 rounded border flex-shrink-0 transition-colors"
                style={{ borderColor: 'var(--map-border)', color: 'var(--map-text-dim)' }}
                title={`Nur ${label} anzeigen`}
              >
                →
              </button>
            )}
          </div>
        ))}
      </div>

      <Separator className="mx-[18px] w-auto" style={{ background: 'var(--map-border)' }} />

      <div className="px-[18px] py-4">
        <p className="text-[12px] uppercase tracking-[.1em] mb-2.5" style={{ color: 'var(--map-text-muted)' }}>Seltenste Angebote</p>
        {rarestServices.map(({ field, label, color: sColor, count }) => (
          <div key={field} className="flex items-center gap-2 mb-1.5">
            <span className="text-[12px] w-[80px] flex-shrink-0 truncate" style={{ color: 'var(--map-text-muted)' }}>{label}</span>
            <div className="flex-1 h-1 rounded-sm" style={{ background: 'var(--map-border)' }}>
              <div className="h-1 rounded-sm" style={{ width: `${(count / maxServiceCount) * 100}%`, background: sColor }} />
            </div>
            <span className="text-[12px] w-6 text-right tabular-nums" style={{ color: 'var(--map-text-muted)' }}>{count}</span>
            {onFilterService && (
              <button
                onClick={() => onFilterService(field)}
                className="text-[9px] px-1.5 py-0.5 rounded border flex-shrink-0 transition-colors"
                style={{ borderColor: 'var(--map-border)', color: 'var(--map-text-dim)' }}
                title={`Nur ${label} anzeigen`}
              >
                →
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

/* ── Station detail ────────────────────────────────────────────── */

function StationContent({ station, allStations }: { station: MapStation; allStations: MapStation[] }) {
  const color = GROUP_NEON[station.groupKey] ?? '#4488aa'
  const groupAvg = avg(allStations.filter((s) => s.groupKey === station.groupKey).map((s) => s.serviceCount))
  const totalAvg = avg(allStations.map((s) => s.serviceCount))
  const diff = station.serviceCount - groupAvg
  const maxCount = 11

  return (
    <>
      <div className="p-[18px] pb-0">
        <Badge className="text-[9px] font-bold tracking-[.1em] mb-2 rounded-full px-2 py-0.5 border" style={{ background: `${color}12`, color, borderColor: `${color}30` }}>
          {GROUP_LABELS[station.groupKey] ?? station.groupKey}
        </Badge>
        <h2 className="text-[21px] font-black leading-[1.15] tracking-[-0.025em]" style={{ color: 'var(--map-text-primary)' }}>
          {station.name}
        </h2>
        {station.adresse && (
          <p className="text-[12px] mt-1" style={{ color: 'var(--map-text-dim)' }}>{station.adresse}</p>
        )}
      </div>

      <Separator className="my-3.5 mx-[18px] w-auto" style={{ background: 'var(--map-border)' }} />

      <div className="px-[18px] pb-3.5">
        <p className="text-[12px] uppercase tracking-[.1em] mb-2.5" style={{ color: 'var(--map-text-muted)' }}>Mobilitätsangebote im Vergleich</p>
        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="text-[42px] font-black leading-none tracking-[-0.04em]" style={{ color }}>{station.serviceCount}</span>
          <span className="text-[14px]" style={{ color: 'var(--map-text-muted)' }}>von 11</span>
        </div>

        {[
          { label: 'Diese Station', value: station.serviceCount, fill: color },
          { label: `Ø ${GROUP_LABELS[station.groupKey] ?? station.groupKey}`, value: groupAvg, fill: `${color}33` },
          { label: 'Ø Gesamt', value: totalAvg, fill: 'var(--map-border)' },
        ].map(({ label, value, fill }) => (
          <div key={label} className="flex items-center gap-2 mb-1.5">
            <span className="text-[12px] w-[80px] flex-shrink-0" style={{ color: 'var(--map-text-muted)' }}>{label}</span>
            <div className="flex-1 h-1 rounded-sm" style={{ background: 'var(--map-border)' }}>
              <div className="h-1 rounded-sm" style={{ width: `${(value / maxCount) * 100}%`, background: fill }} />
            </div>
            <span className="text-[12px] w-6 text-right" style={{ color: 'var(--map-text-muted)' }}>
              {value.toLocaleString('de-DE', { maximumFractionDigits: 1 })}
            </span>
          </div>
        ))}

        {Math.abs(diff) >= 0.5 && (
          <div className="mt-2.5 p-2.5 rounded-md border-l-2 text-[11px] leading-relaxed"
            style={{ background: `${color}0a`, borderLeftColor: `${color}66`, color: 'var(--map-text-muted)' }}>
            {diff > 0 ? (
              <><span style={{ color }} className="font-semibold">+{diff.toLocaleString('de-DE', { maximumFractionDigits: 1 })}</span> über dem Anschlussdurchschnitt</>
            ) : (
              <><span style={{ color: '#ff4455' }} className="font-semibold">{diff.toLocaleString('de-DE', { maximumFractionDigits: 1 })}</span> unter dem Anschlussdurchschnitt</>
            )}
          </div>
        )}
      </div>

      <Separator className="mx-[18px] w-auto" style={{ background: 'var(--map-border)' }} />

      <div className="px-[18px] py-4">
        <p className="text-[12px] uppercase tracking-[.1em] mb-2.5" style={{ color: 'var(--map-text-muted)' }}>Alle Mobilitätsangebote</p>
        <div className="grid grid-cols-2 gap-1">
          {SERVICE_DEFINITIONS.map((svc) => {
            const present = station.services[svc.field] === true
            return (
              <div key={svc.field} className="flex items-center gap-1.5 px-1.5 py-1 rounded"
                style={{ background: present ? '#0b1420' : 'transparent', opacity: present ? 1 : 0.22 }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: present ? svc.color : 'var(--map-border)', boxShadow: present ? `0 0 3px ${svc.color}33` : 'none' }} />
                <span className="text-[12px]" style={{ color: 'var(--map-text-primary)' }}>{svc.label}</span>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

/* ── Main export ───────────────────────────────────────────────── */

export function DetailPanel({ station, allStations, onClose, onFilterService }: DetailPanelProps) {
  // Desktop sidebar (idle overview)
  const desktopIdle = (
    <aside
      className="hidden md:flex w-[272px] flex-shrink-0 flex-col overflow-y-auto border-l"
      style={{ background: 'var(--map-surface)', borderColor: 'var(--map-border)' }}
    >
      <IdleContent allStations={allStations} onFilterService={onFilterService} />
    </aside>
  )

  // Desktop sidebar (station selected)
  const desktopStation = station && (
    <aside
      className="hidden md:flex w-[272px] flex-shrink-0 flex-col overflow-y-auto border-l"
      style={{ background: 'var(--map-surface)', borderColor: 'var(--map-border)' }}
    >
      <StationContent station={station} allStations={allStations} />
    </aside>
  )

  // Mobile bottom-sheet (station selected only)
  const mobileSheet = station && (
    <>
      {/* Backdrop */}
      <div
        className="md:hidden fixed inset-0 z-20"
        style={{ background: 'rgba(0,0,0,0.4)' }}
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 max-h-[60vh] overflow-y-auto rounded-t-xl bottom-sheet-enter"
        style={{ background: 'var(--map-surface)', borderTop: '1px solid var(--map-border)' }}
      >
        {/* Drag handle + close */}
        <div className="sticky top-0 flex items-center justify-between px-4 pt-2 pb-1" style={{ background: 'var(--map-surface)' }}>
          <div className="w-8 h-1 rounded-full mx-auto" style={{ background: 'var(--map-border)' }} />
          <button
            onClick={onClose}
            className="absolute right-3 top-2 w-7 h-7 flex items-center justify-center rounded-full"
            style={{ color: 'var(--map-text-muted)' }}
          >
            <X size={14} />
          </button>
        </div>
        <StationContent station={station} allStations={allStations} />
      </div>
    </>
  )

  return (
    <>
      {station ? desktopStation : desktopIdle}
      {mobileSheet}
    </>
  )
}
