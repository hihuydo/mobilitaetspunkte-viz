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
      className="grid grid-cols-[1fr_auto_1fr] items-center px-5 py-2.5 flex-shrink-0 border-b gap-4"
      style={{ background: 'var(--map-surface)', borderColor: 'var(--map-border)' }}
    >
      {/* Left: Title + subtitle */}
      <div className="flex flex-col">
        <span
          className="text-[15px] font-bold uppercase tracking-[.06em] whitespace-nowrap"
          style={{ color: 'var(--map-text-primary)' }}
        >
          Münchner Mobilitätspunkte
        </span>
        <span
          className="text-[11px] whitespace-nowrap"
          style={{ color: 'var(--map-text-dim)' }}
        >
          {isFiltering
            ? `${matchCount} von ${stationCount} Stationen`
            : `${stationCount} Stationen · 11 Dienste · Erkunde Münchens Mobilitätsnetz`}
        </span>
      </div>

      {/* Center: Search */}
      <div className="relative w-full max-w-[480px] justify-self-center">
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

      {/* Right: empty for balance */}
      <div />
    </header>
  )
}
