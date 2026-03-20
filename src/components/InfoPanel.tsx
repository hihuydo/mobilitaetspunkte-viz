import { memo } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface InfoPanelProps {
  onClose: () => void
}

export const InfoPanel = memo(function InfoPanel({ onClose }: InfoPanelProps) {
  return (
    <Card className="absolute top-4 left-4 w-[280px] max-h-[calc(100%-32px)] overflow-y-auto z-10 backdrop-blur-sm">
      {/* Sticky header — must be a direct child of Card (before CardContent) so sticky works */}
      <div className="sticky top-0 bg-card/95 border-b border-border px-5 py-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-2 right-2 h-7 w-7"
        >
          <X size={16} />
        </Button>
        <div className="text-base font-semibold text-foreground tracking-wide pr-5">
          So liest du diese Grafik
        </div>
      </div>

      {/* Scrollable body */}
      <CardContent className="px-5 py-4 space-y-5">
        {/* Section 1 */}
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
            Was du siehst
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            116 Münchner{' '}
            <span className="text-foreground font-semibold">Mobilitätspunkte</span> — Orte,
            an denen verschiedene Verkehrsmittel gebündelt sind. Jeder Strich steht für eine
            Station.
            <br />
            <br />
            Die{' '}
            <span className="text-foreground font-semibold">11 konzentrischen Ringe</span>{' '}
            zeigen, welche Dienste vorhanden sind: von S-Bahn (innen) bis Fahrradpumpe (außen).
            <br />
            <br />
            Die Stationen sind in vier Gruppen gegliedert:{' '}
            <span className="text-foreground font-semibold">S-Bahn, U-Bahn, Tram und Bus</span>{' '}
            — je nach ihrem wichtigsten ÖPNV-Anschluss.
          </p>
        </div>

        {/* Section 2 */}
        <div>
          <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2">
            Wie erkunden
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <span className="text-foreground">↗ Strich hovern</span> — Details zur Station:
            Adresse, alle vorhandenen Dienste, Anzahl Carsharing-Plätze.
            <br />
            <span className="text-foreground">↗ Legende hovern</span> — Alle Stationen mit
            diesem Dienst hervorheben; Zentrum zeigt den Dienstnamen.
          </p>
        </div>
      </CardContent>
    </Card>
  )
})
