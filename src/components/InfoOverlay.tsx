// src/components/InfoOverlay.tsx
import { useState } from 'react'

export function InfoOverlay() {
  const [open, setOpen] = useState(false)
  const [hasOpened, setHasOpened] = useState(false)

  const handleToggle = () => {
    setOpen((v) => !v)
    if (!hasOpened) setHasOpened(true)
  }

  return (
    <div className="absolute top-3.5 left-3.5 z-10">
      {/* Toggle button — pulses until first opened */}
      <button
        onClick={handleToggle}
        title="Info & Anleitung"
        className={`w-7 h-7 rounded-full border flex items-center justify-center text-[13px] italic font-bold transition-colors ${!hasOpened && !open ? 'info-pulse' : ''}`}
        style={{
          fontFamily: 'Georgia, serif',
          background: open ? '#0e1828' : '#0b1420',
          borderColor: open ? '#3a5070' : 'var(--map-border)',
          color: open ? '#8ab0cc' : 'var(--map-text-muted)',
        }}
      >
        i
      </button>

      {/* Panel */}
      {open && (
        <div
          className="mt-1.5 w-[calc(100vw-32px)] max-w-[260px] rounded-lg border p-3.5 text-[11px] leading-relaxed"
          style={{
            background: 'var(--map-surface)',
            borderColor: 'var(--map-border)',
            boxShadow: '0 4px 24px #00000066',
          }}
        >
          <h3 className="text-[10px] font-bold uppercase tracking-[.06em] mb-2" style={{ color: '#8ab0cc' }}>
            Anleitung
          </h3>
          {[
            ['🔍', 'Suche', 'Tippe einen Stationsnamen in die Suchleiste oben.'],
            ['🎛️', 'Filtern', 'Nutze die Anschluss- und Mobilitätsangebote-Filter, um gezielt zu filtern. Mehrere Angebote = nur Stationen mit allen.'],
            ['👆', 'Details', 'Klicke auf einen Punkt auf der Karte. Rechts erscheint ein Vergleich mit dem Anschlussdurchschnitt und allen verfügbaren Angeboten.'],
            ['🔎', 'Zoom', 'Scrolle zum Zoomen oder nutze die + / − Buttons oben rechts. Ziehe die Karte zum Verschieben.'],
            ['🎨', 'Farben & Größe', 'Farbe = primärer ÖPNV-Anschluss (S-Bahn, U-Bahn, Tram, Bus). Größe = Anzahl verfügbarer Angebote (1–11).'],
            ['📊', 'Überblick', 'Ohne Auswahl zeigt das rechte Panel Gesamtstatistiken: Anschluss-Verteilung, häufigste und seltenste Angebote.'],
          ].map(([icon, title, text]) => (
            <div
              key={title as string}
              className="flex items-start gap-1.5 p-1.5 rounded mb-1"
              style={{ background: '#0b1420', color: 'var(--map-text-dim)' }}
            >
              <span className="flex-shrink-0">{icon}</span>
              <span>
                <strong style={{ color: '#8ab0cc' }}>{title}</strong>
                {' — '}{text}
              </span>
            </div>
          ))}

          <p className="mt-2 text-[9px]" style={{ color: 'var(--map-text-dim)' }}>
            Klicke erneut auf <em>i</em> um dieses Panel zu schließen.
          </p>
        </div>
      )}
    </div>
  )
}
