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
        height: 48,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: '0 16px',
        opacity: containerOpacity,
        transition: 'opacity 150ms ease-out',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      }}
    >
      <div
        style={{
          fontSize: 10,
          color: '#4a7fa8',
          letterSpacing: 1,
          marginBottom: 2,
          userSelect: 'none',
        }}
      >
        SERVICE RINGS (inner → outer)
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px', justifyContent: 'center' }}>
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
              style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}
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
                  fontSize: 11,
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
