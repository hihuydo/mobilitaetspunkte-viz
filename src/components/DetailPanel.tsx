// src/components/DetailPanel.tsx
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { SERVICE_DEFINITIONS } from '../lib/colors'
import type { MapStation } from '../lib/mapLayout'
import { GROUP_NEON } from '../lib/mapLayout'

interface DetailPanelProps {
  station: MapStation | null
  allStations: MapStation[]
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

export function DetailPanel({ station, allStations }: DetailPanelProps) {
  if (!station) {
    return (
      <aside
        className="w-[272px] flex-shrink-0 flex flex-col items-center justify-center border-l"
        style={{ background: 'var(--map-surface)', borderColor: 'var(--map-border)' }}
      >
        <p
          className="text-[11px] text-center px-6 leading-relaxed"
          style={{ color: 'var(--map-text-dim)' }}
        >
          Klicke auf einen Punkt auf der Karte für Details
        </p>
      </aside>
    )
  }

  const color = GROUP_NEON[station.groupKey] ?? '#4488aa'
  const groupAvg = avg(
    allStations.filter((s) => s.groupKey === station.groupKey).map((s) => s.serviceCount)
  )
  const totalAvg = avg(allStations.map((s) => s.serviceCount))
  const diff = station.serviceCount - groupAvg
  const maxCount = 11

  return (
    <aside
      className="w-[272px] flex-shrink-0 flex flex-col overflow-y-auto border-l"
      style={{ background: 'var(--map-surface)', borderColor: 'var(--map-border)' }}
    >
      {/* Header */}
      <div className="p-[18px] pb-0">
        <Badge
          className="text-[9px] font-bold tracking-[.1em] mb-2 rounded-full px-2 py-0.5 border"
          style={{ background: `${color}12`, color, borderColor: `${color}30` }}
        >
          {GROUP_LABELS[station.groupKey] ?? station.groupKey}
        </Badge>
        <h2
          className="text-[21px] font-black leading-[1.15] tracking-[-0.025em]"
          style={{ color: 'var(--map-text-primary)' }}
        >
          {station.name}
        </h2>
        {station.adresse && (
          <p className="text-[10px] mt-1" style={{ color: 'var(--map-text-dim)' }}>
            {station.adresse}
          </p>
        )}
      </div>

      <Separator className="my-3.5 mx-[18px] w-auto" style={{ background: 'var(--map-border)' }} />

      {/* Service comparison */}
      <div className="px-[18px] pb-3.5">
        <p className="text-[10px] uppercase tracking-[.1em] mb-2.5" style={{ color: 'var(--map-text-muted)' }}>
          Dienste im Vergleich
        </p>

        {/* Big number */}
        <div className="flex items-baseline gap-1.5 mb-3">
          <span className="text-[42px] font-black leading-none tracking-[-0.04em]" style={{ color }}>
            {station.serviceCount}
          </span>
          <span className="text-[13px]" style={{ color: 'var(--map-text-muted)' }}>
            von 11
          </span>
        </div>

        {/* Comparison bars */}
        {[
          { label: 'Diese Station', value: station.serviceCount, fill: color },
          { label: `Ø ${GROUP_LABELS[station.groupKey] ?? station.groupKey}`, value: groupAvg, fill: `${color}33` },
          { label: 'Ø Gesamt', value: totalAvg, fill: 'var(--map-border)' },
        ].map(({ label, value, fill }) => (
          <div key={label} className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] w-[80px] flex-shrink-0" style={{ color: 'var(--map-text-muted)' }}>
              {label}
            </span>
            <div className="flex-1 h-1 rounded-sm" style={{ background: 'var(--map-border)' }}>
              <div
                className="h-1 rounded-sm"
                style={{ width: `${(value / maxCount) * 100}%`, background: fill }}
              />
            </div>
            <span className="text-[10px] w-6 text-right" style={{ color: 'var(--map-text-muted)' }}>
              {value.toLocaleString('de-DE', { maximumFractionDigits: 1 })}
            </span>
          </div>
        ))}

        {/* Context note */}
        {Math.abs(diff) >= 0.5 && (
          <div
            className="mt-2.5 p-2.5 rounded-md border-l-2 text-[11px] leading-relaxed"
            style={{
              background: `${color}0a`,
              borderLeftColor: `${color}66`,
              color: 'var(--map-text-muted)',
            }}
          >
            {diff > 0 ? (
              <><span style={{ color }} className="font-semibold">+{diff.toLocaleString('de-DE', { maximumFractionDigits: 1 })}</span> über dem Gruppendurchschnitt</>
            ) : (
              <><span style={{ color: '#ff4455' }} className="font-semibold">{diff.toLocaleString('de-DE', { maximumFractionDigits: 1 })}</span> unter dem Gruppendurchschnitt</>
            )}
          </div>
        )}
      </div>

      <Separator className="mx-[18px] w-auto" style={{ background: 'var(--map-border)' }} />

      {/* Service grid */}
      <div className="px-[18px] py-4">
        <p className="text-[10px] uppercase tracking-[.1em] mb-2.5" style={{ color: 'var(--map-text-muted)' }}>
          Alle Dienste
        </p>
        <div className="grid grid-cols-2 gap-1">
          {SERVICE_DEFINITIONS.map((svc) => {
            const present = station.services[svc.field] === true
            return (
              <div
                key={svc.field}
                className="flex items-center gap-1.5 px-1.5 py-1 rounded"
                style={{
                  background: present ? '#0b1420' : 'transparent',
                  opacity: present ? 1 : 0.22,
                }}
              >
                <div
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{
                    background: present ? svc.color : 'var(--map-border)',
                    boxShadow: present ? `0 0 3px ${svc.color}33` : 'none',
                  }}
                />
                <span className="text-[10px]" style={{ color: 'var(--map-text-primary)' }}>
                  {svc.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
