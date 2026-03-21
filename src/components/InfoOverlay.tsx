// src/components/InfoOverlay.tsx
import { useState } from 'react'

export function InfoOverlay() {
  const [open, setOpen] = useState(false)

  return (
    <div className="absolute top-3.5 left-3.5 z-10">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        title="Info & Anleitung"
        className="w-7 h-7 rounded-full border flex items-center justify-center text-[13px] italic font-bold transition-colors"
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
          className="mt-1.5 w-[240px] rounded-lg border p-3.5 text-[11px] leading-relaxed"
          style={{
            background: 'var(--map-surface)',
            borderColor: 'var(--map-border)',
            boxShadow: '0 4px 24px #00000066',
          }}
        >
          <h3 className="text-[10px] font-bold uppercase tracking-[.06em] mb-2" style={{ color: '#8ab0cc' }}>
            Über diese Karte
          </h3>
          <p style={{ color: 'var(--map-text-muted)' }}>
            Diese Karte zeigt alle{' '}
            <strong style={{ color: '#8ab0cc' }}>137 Münchner Mobilitätspunkte</strong> —
            öffentliche Knotenpunkte, an denen verschiedene Verkehrsmittel zusammenkommen.
          </p>
          <p className="mt-2" style={{ color: 'var(--map-text-muted)' }}>
            Die <strong style={{ color: '#8ab0cc' }}>Größe</strong> eines Punktes zeigt,
            wie viele der 11 möglichen Dienste dort verfügbar sind.
          </p>

          <h3 className="text-[10px] font-bold uppercase tracking-[.06em] mt-3 mb-2" style={{ color: '#8ab0cc' }}>
            So funktioniert's
          </h3>
          {[
            ['🔍', 'Suche nach einer Station über das Suchfeld'],
            ['🔵', 'Filtere nach Verkehrsmitteln mit den Chips rechts'],
            ['👆', 'Klicke auf einen Punkt für Details und Gruppenvergleich'],
            ['🎨', 'Farben zeigen die primäre Anbindung: S-Bahn, U-Bahn, Tram, Bus'],
          ].map(([icon, text]) => (
            <div
              key={text as string}
              className="flex items-start gap-1.5 p-1.5 rounded mb-1.5"
              style={{ background: '#0b1420', color: 'var(--map-text-dim)' }}
            >
              <span className="flex-shrink-0">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
