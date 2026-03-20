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
  // Numeric opacity is acceptable as a literal (semantic: 50% idle / 100% active)
  const containerOpacity = isRingHover || isStationHover ? 1 : 0.5

  return (
    <div
      className="flex flex-col gap-1 transition-opacity duration-150"
      style={{ opacity: containerOpacity }}
    >
      <div className="flex flex-col gap-2">
        {SERVICE_DEFINITIONS.map((svc, i) => {
          const isHovered = hoveredRingIndex === i

          // CSS custom properties — no hex literals.
          // --color-legend-label is defined as bare HSL channels (e.g. "210 55% 70%")
          // enabling the hsl(var(...) / 0.4) opacity composition syntax.
          const labelColor = isHovered
            ? 'hsl(var(--color-legend-label-active))'
            : isRingHover
            ? 'hsl(var(--color-legend-label) / 0.4)'
            : 'hsl(var(--color-legend-label))'

          return (
            <div
              key={svc.field}
              className="flex items-center gap-1.5 cursor-pointer"
              onMouseEnter={() => onRingEnter(i)}
              onMouseLeave={onRingLeave}
            >
              {/* svc.color = data-encoding visualization color from colors.ts — not a design token */}
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0 transition-opacity duration-150"
                style={{
                  background: svc.color,
                  opacity: isRingHover && !isHovered ? 0.4 : 1,
                }}
              />
              <span
                className="text-xs select-none transition-colors duration-150"
                style={{ color: labelColor }}
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
