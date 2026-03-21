import { createPortal } from 'react-dom'
import type { MapStation } from '../lib/mapLayout'
import { GROUP_NEON } from '../lib/mapLayout'

interface MapTooltipProps {
  station: MapStation | null
  mouseX: number
  mouseY: number
}

const OFFSET = 12
const TOOLTIP_W = 200
const TOOLTIP_H = 60

const isTouchDevice = typeof window !== 'undefined' && 'ontouchstart' in window

export default function MapTooltip({ station, mouseX, mouseY }: MapTooltipProps) {
  // Hide tooltip on touch devices — bottom-sheet handles details
  if (!station || isTouchDevice) return null

  const flipX = mouseX + OFFSET + TOOLTIP_W > window.innerWidth
  const flipY = mouseY + OFFSET + TOOLTIP_H > window.innerHeight

  const left = flipX ? mouseX - OFFSET - TOOLTIP_W : mouseX + OFFSET
  const top = flipY ? mouseY - OFFSET - TOOLTIP_H : mouseY + OFFSET

  const dotColor = GROUP_NEON[station.groupKey] ?? GROUP_NEON['none']

  return createPortal(
    <div
      style={{
        position: 'fixed',
        left,
        top,
        pointerEvents: 'none',
        background: 'var(--map-surface)',
        border: '1px solid var(--map-border)',
        borderRadius: 6,
        padding: '8px 10px',
        zIndex: 9999,
        maxWidth: TOOLTIP_W,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: dotColor,
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontWeight: 700,
            fontSize: 12,
            color: 'var(--map-text-primary)',
            lineHeight: 1.3,
          }}
        >
          {station.name}
        </span>
      </div>
      <div
        style={{
          fontSize: 10,
          color: 'var(--map-text-muted)',
          marginTop: 4,
          paddingLeft: 14,
        }}
      >
        {station.serviceCount} von 11 Diensten
      </div>
    </div>,
    document.body,
  )
}
