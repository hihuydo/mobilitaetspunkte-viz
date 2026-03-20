import { SERVICE_DEFINITIONS } from '../lib/colors'

interface LegendProps {
  hoveredRingIndex: number | null
  isStationHover: boolean
  onRingEnter: (index: number) => void
  onRingLeave: () => void
}

export function Legend({
  hoveredRingIndex,
  isStationHover,
  onRingEnter,
  onRingLeave,
}: LegendProps) {
  const isRingHover = hoveredRingIndex !== null
  const containerOpacity = isRingHover || isStationHover ? 1 : 0.5

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        gap: 4,
        padding: 0,
        opacity: containerOpacity,
        transition: 'opacity 150ms ease-out',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      {/* Items list — vertical */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SERVICE_DEFINITIONS.map((svc, i) => {
          const isHovered = hoveredRingIndex === i
          const labelColor = isHovered
            ? '#c9d8e8'
            : isRingHover
            ? 'rgba(138, 180, 212, 0.4)'
            : '#8ab4d4'

          return (
            <div
              key={svc.field}
              style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
              onMouseEnter={() => onRingEnter(i)}
              onMouseLeave={onRingLeave}
            >
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: svc.color,
                  flexShrink: 0,
                  opacity: isRingHover && !isHovered ? 0.4 : 1,
                  transition: 'opacity 150ms ease-out',
                }}
              />
              <span
                style={{
                  fontSize: 12,
                  color: labelColor,
                  transition: 'color 150ms ease-out',
                  userSelect: 'none',
                }}
              >
                {svc.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
