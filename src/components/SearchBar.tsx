// src/components/SearchBar.tsx
import { useState, useEffect } from 'react'
import { levenshtein } from '../lib/levenshtein'
import type { StationGeometry } from '../lib/layout'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface SearchBarProps {
  stations: StationGeometry[]
  searchQuery: string
  onSearch: (query: string, matchingIndices: Set<number>) => void
}

// Score = min levenshtein distance between query and any word token of the station name.
// Tokens split on spaces and hyphens. Handles e.g. "Fryhait" → "Freiheit" correctly.
function stationScore(query: string, name: string): number {
  const tokens = name.toLowerCase().split(/[\s-]+/).filter(Boolean)
  if (tokens.length === 0) return Infinity
  return Math.min(...tokens.map((t) => levenshtein(query.toLowerCase(), t)))
}

export function SearchBar({ stations, searchQuery, onSearch }: SearchBarProps) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<StationGeometry[]>([])

  // Sync input when searchQuery changes externally (suggestion click path).
  // Guard prevents echo: when user types, onSearch → App sets searchQuery to the same
  // string → this effect fires but searchQuery === inputValue so nothing happens.
  useEffect(() => {
    if (searchQuery !== inputValue) {
      setInputValue(searchQuery)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery])

  // Clear suggestions when input returns to a state with substring matches
  useEffect(() => {
    if (inputValue === '') {
      setSuggestions([])
      return
    }
    const q = inputValue.toLowerCase()
    const hasSubstring = stations.some((s) => s.name.toLowerCase().includes(q))
    if (hasSubstring || inputValue.length < 3) {
      setSuggestions([])
    }
  }, [inputValue, stations])

  const runSearch = (query: string) => {
    if (query === '') {
      onSearch('', new Set())
      setSuggestions([])
      return
    }
    const q = query.toLowerCase()
    const matches = stations.filter((s) => s.name.toLowerCase().includes(q))
    if (matches.length > 0) {
      onSearch(query, new Set(matches.map((s) => s.stationIndex)))
      return
    }
    if (query.length < 3) {
      onSearch(query, new Set())
      return
    }
    const scored = stations.map((s) => ({ s, score: stationScore(query, s.name) }))
    const minScore = Math.min(...scored.map((x) => x.score))
    const topMatches = scored
      .filter((x) => x.score === minScore)
      .map((x) => x.s)
      .sort((a, b) => a.name.localeCompare(b.name, 'de'))
      .slice(0, 2)
    onSearch(query, new Set())
    setSuggestions(topMatches)
  }

  const handleChange = (value: string) => {
    setInputValue(value)
    runSearch(value)
  }

  const handleClear = () => {
    setInputValue('')
    setSuggestions([])
    onSearch('', new Set())
  }

  const handleSuggestionClick = (station: StationGeometry) => {
    // Do NOT call setInputValue — guarded useEffect syncs it from searchQuery
    onSearch(station.name, new Set([station.stationIndex]))
  }

  return (
    <div className="w-full">
      <div className="relative">
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Station suchen…"
          className="w-full pr-8"
        />
        {inputValue && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            aria-label="Suche löschen"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
          >
            <X size={12} />
          </Button>
        )}
      </div>

      {suggestions.length > 0 && (
        <div className="mt-2 space-y-1">
          {suggestions.map((station) => (
            <Button
              key={station.stationIndex}
              variant="ghost"
              className="w-full justify-start text-sm h-auto py-1 px-2"
              onClick={() => handleSuggestionClick(station)}
            >
              <span className="text-muted-foreground">Meinst du: </span>
              <span className="text-foreground font-medium ml-1">{station.name}</span>
              <span className="text-muted-foreground">?</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
