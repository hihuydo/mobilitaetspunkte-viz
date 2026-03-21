// src/components/NavBar.tsx
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

interface NavBarProps {
  searchQuery: string
  onSearch: (q: string) => void
  stationCount: number
  matchCount: number
  isFiltering: boolean
}

export function NavBar({ searchQuery, onSearch, stationCount, matchCount, isFiltering }: NavBarProps) {
  return (
    <header
      className="flex flex-col gap-1.5 px-4 py-2 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:px-5 md:py-2.5 md:gap-4 flex-shrink-0 border-b"
      style={{ background: 'var(--map-surface)', borderColor: 'var(--map-border)' }}
    >
      {/* Title + subtitle */}
      <div className="flex flex-col">
        <span
          className="text-[13px] md:text-[15px] font-bold uppercase tracking-[.06em] whitespace-nowrap"
          style={{ color: 'var(--map-text-primary)' }}
        >
          Münchner Mobilitätspunkte
        </span>
        <span
          className="text-[10px] md:text-[11px] whitespace-nowrap"
          style={{ color: 'var(--map-text-dim)' }}
        >
          {isFiltering
            ? `${matchCount} von ${stationCount} Stationen`
            : `${stationCount} Stationen · 11 Dienste · Erkunde Münchens Mobilitätsnetz`}
        </span>
      </div>

      {/* Search */}
      <div className="relative w-full md:max-w-[480px] md:justify-self-center">
        <Search
          size={13}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--map-text-dim)' }}
        />
        <Input
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Station suchen…"
          className="pl-8 text-[12px] h-8 rounded-lg border focus-visible:ring-0 focus-visible:ring-offset-0"
          style={{
            background: '#0b1018',
            borderColor: 'var(--map-border)',
            color: 'var(--map-text-primary)',
          }}
        />
      </div>

      {/* Right: empty for balance (desktop only) */}
      <div className="hidden md:block" />
    </header>
  )
}
