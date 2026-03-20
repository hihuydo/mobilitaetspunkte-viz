interface InfoPanelProps {
  onClose: () => void
}

export function InfoPanel({ onClose }: InfoPanelProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: 16,
        left: 16,
        width: 220,
        maxHeight: 'calc(100% - 32px)',
        overflowY: 'auto',
        background: 'rgba(10, 18, 32, 0.94)',
        border: '1px solid #1a2a45',
        borderRadius: 8,
        padding: '14px 16px',
        backdropFilter: 'blur(4px)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
        zIndex: 10,
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 8,
          right: 10,
          background: 'none',
          border: 'none',
          color: '#4a7fa8',
          fontSize: 14,
          lineHeight: 1,
          cursor: 'pointer',
          padding: 0,
        }}
      >
        ×
      </button>

      {/* Title */}
      <div
        style={{
          fontSize: 10,
          fontWeight: 600,
          color: '#c9d8e8',
          letterSpacing: '0.5px',
          marginBottom: 10,
          paddingRight: 16,
        }}
      >
        So liest du diese Grafik
      </div>

      {/* Section 1: Was du siehst */}
      <div
        style={{
          fontSize: 8.5,
          color: '#4a7fa8',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginBottom: 4,
        }}
      >
        Was du siehst
      </div>
      <div
        style={{
          fontSize: 8.5,
          color: '#6a94b0',
          lineHeight: 1.55,
          marginBottom: 10,
        }}
      >
        116 Münchner{' '}
        <span style={{ color: '#8ab4d4', fontWeight: 600 }}>Mobilitätspunkte</span> — Orte,
        an denen verschiedene Verkehrsmittel gebündelt sind. Jeder Strich steht für eine
        Station.
        <br />
        <br />
        Die{' '}
        <span style={{ color: '#8ab4d4', fontWeight: 600 }}>11 konzentrischen Ringe</span>{' '}
        zeigen, welche Dienste vorhanden sind: von S-Bahn (innen) bis Fahrradpumpe (außen).
        <br />
        <br />
        Die Stationen sind in vier Gruppen gegliedert:{' '}
        <span style={{ color: '#8ab4d4', fontWeight: 600 }}>S-Bahn, U-Bahn, Tram und Bus</span>{' '}
        — je nach ihrem wichtigsten ÖPNV-Anschluss.
      </div>

      {/* Section 2: Wie erkunden */}
      <div
        style={{
          fontSize: 8.5,
          color: '#4a7fa8',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginBottom: 4,
        }}
      >
        Wie erkunden
      </div>
      <div style={{ fontSize: 8.5, color: '#6a94b0', lineHeight: 1.6 }}>
        <span style={{ color: '#8ab4d4' }}>↗ Strich hovern</span> — Details zur Station:
        Adresse, alle vorhandenen Dienste, Anzahl Carsharing-Plätze.
        <br />
        <span style={{ color: '#8ab4d4' }}>↗ Legende hovern</span> — Alle Stationen mit
        diesem Dienst hervorheben; Zentrum zeigt den Dienstnamen.
      </div>
    </div>
  )
}
