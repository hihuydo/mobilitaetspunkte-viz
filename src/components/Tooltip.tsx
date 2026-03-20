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
      className="fixed z-50 pointer-events-none bg-popover border border-border rounded-md shadow-lg px-3 py-2 max-w-[220px]"
      style={{ left: x, top: y }}
    >
      <div className="text-sm font-semibold text-foreground mb-0.5">
        {station.name}
      </div>
      <div className="text-xs text-muted-foreground mb-2">
        {station.adresse}
      </div>
      <div className="border-t border-border pt-2 mb-2">
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          {activeServices.map((svc) => (
            <div key={svc.field} className="flex items-center gap-1">
              {/* svc.color is a data-encoding visualization color — intentionally not a token */}
              <div
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: svc.color }}
              />
              <span className="text-xs text-muted-foreground">{svc.label}</span>
            </div>
          ))}
        </div>
      </div>
      {station.anzStellplCs > 0 && (
        <div className="border-t border-border pt-2">
          <span className="text-xs text-muted-foreground">
            Carsharing-Stellplätze: {station.anzStellplCs}
          </span>
        </div>
      )}
    </div>
  )

  return createPortal(tooltip, document.body)
}
