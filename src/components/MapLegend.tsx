// src/components/MapLegend.tsx
import { GROUP_NEON } from '../lib/mapLayout'

const GROUP_ITEMS = [
  { key: 's-bahn', label: 'S-Bahn' },
  { key: 'u-bahn', label: 'U-Bahn' },
  { key: 'tram',   label: 'Tram' },
  { key: 'bus',    label: 'Bus' },
  { key: 'none',   label: 'Sonstige' },
]

export function MapLegend() {
  return (
    <>
      {/* Bottom-left: color legend */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-1.5 pointer-events-none">
        {GROUP_ITEMS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--map-text-muted)' }}>
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{
                background: GROUP_NEON[key],
                boxShadow: `0 0 3px ${GROUP_NEON[key]}44`,
              }}
            />
            {label}
          </div>
        ))}
      </div>

      {/* Bottom-right: size legend */}
      <div className="absolute bottom-4 right-4 text-[10px] text-right pointer-events-none" style={{ color: 'var(--map-text-muted)' }}>
        <svg width="80" height="36" viewBox="0 0 80 36" className="block ml-auto mb-0.5">
          <circle cx="8"  cy="31" r="4"  fill="#557799" opacity="0.8"/>
          <circle cx="26" cy="28" r="7"  fill="#557799" opacity="0.8"/>
          <circle cx="52" cy="22" r="13" fill="#557799" opacity="0.8"/>
          <text x="8"  y="15" fontSize="7" fill="#4a6080" textAnchor="middle">1</text>
          <text x="76" y="15" fontSize="7" fill="#4a6080" textAnchor="end">11</text>
        </svg>
        Größe = Anzahl Dienste
      </div>
    </>
  )
}
