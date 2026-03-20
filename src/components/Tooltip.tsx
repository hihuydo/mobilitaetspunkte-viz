import { createPortal } from 'react-dom'
import { SERVICE_DEFINITIONS } from '../lib/colors'
import type { StationGeometry } from '../lib/layout'

interface TooltipProps {
  station: StationGeometry | null
  mouseX: number
  mouseY: number
}

export function Tooltip({ station, mouseX, mouseY }: TooltipProps) {
  if (station === null) return null

  // Compute clamped position inline — pure math, no useEffect needed
  const OFFSET = 12
  const W = 220
  const H = 180

  let x = mouseX + OFFSET
  let y = mouseY + OFFSET

  if (typeof window !== 'undefined') {
    if (x + W > window.innerWidth) x = mouseX - W - OFFSET
    if (y + H > window.innerHeight) y = mouseY - H - OFFSET
  }

  const activeServices = SERVICE_DEFINITIONS.filter(
    (svc) => station.services[svc.field] === true,
  )

  const tooltip = (
    <div
      style={{
        position: 'fixed',
        left: x,
        top: y,
        background: '#0a1220',
        border: '1px solid #1a2a45',
        borderRadius: 6,
        padding: '12px 14px',
        maxWidth: 220,
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
        pointerEvents: 'none',
        zIndex: 1000,
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 600, color: '#c9d8e8', marginBottom: 2 }}>
        {station.name}
      </div>
      <div style={{ fontSize: 11, color: '#6a94b0', marginBottom: 8 }}>
        {station.adresse}
      </div>
      <div style={{ borderTop: '1px solid #1a2a45', paddingTop: 8, marginBottom: 8 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 8px' }}>
          {activeServices.map((svc) => (
            <div key={svc.field} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: svc.color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: 11, color: '#8ab4d4' }}>{svc.label}</span>
            </div>
          ))}
        </div>
      </div>
      {station.anzStellplCs > 0 && (
        <div style={{ borderTop: '1px solid #1a2a45', paddingTop: 8 }}>
          <span style={{ fontSize: 11, color: '#6a94b0' }}>
            Carsharing-Stellplätze: {station.anzStellplCs}
          </span>
        </div>
      )}
    </div>
  )

  return createPortal(tooltip, document.body)
}
