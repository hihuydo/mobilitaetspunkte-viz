// src/components/NavBar.tsx
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { FilterChips } from './FilterChips'

interface NavBarProps {
  searchQuery: string
  onSearch: (q: string) => void
  activeGroupKeys: Set<string>
  onToggleGroup: (key: string) => void
}

export function NavBar({ searchQuery, onSearch, activeGroupKeys, onToggleGroup }: NavBarProps) {
  return (
    <header
      className="flex items-center gap-4 px-5 py-2.5 flex-shrink-0 border-b"
      style={{ background: 'var(--map-surface)', borderColor: 'var(--map-border)' }}
    >
      {/* Title */}
      <span
        className="text-[12px] font-bold uppercase tracking-[.06em] whitespace-nowrap"
        style={{ color: 'var(--map-text-primary)' }}
      >
        Münchner Mobilitätspunkte
      </span>

      {/* Separator */}
      <div className="w-px h-4 flex-shrink-0" style={{ background: 'var(--map-border)' }} />

      {/* Search — prominent, fixed width */}
      <div className="relative flex-shrink-0 w-[360px]">
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

      {/* Filter chips — pushed to right */}
      <div className="ml-auto">
        <FilterChips activeKeys={activeGroupKeys} onToggle={onToggleGroup} />
      </div>
    </header>
  )
}
