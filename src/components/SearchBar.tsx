// src/components/SearchBar.tsx
import { useState, useEffect } from 'react'
import { levenshtein } from '../lib/levenshtein'
import type { StationGeometry } from '../lib/layout'

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
  // All state declared first — ensures setters are in scope for all handlers below
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState<StationGeometry[]>([])

  // Sync input when searchQuery changes externally (suggestion click path).
  // Guard prevents echo: when user types, onSearch → App sets searchQuery to the same
  // string → this effect fires but searchQuery === inputValue so nothing happens.
  // Only the suggestion-click path changes searchQuery to a different value.
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
    // Phase 1: substring match
    const q = query.toLowerCase()
    const matches = stations.filter((s) => s.name.toLowerCase().includes(q))
    if (matches.length > 0) {
      onSearch(query, new Set(matches.map((s) => s.stationIndex)))
      return
    }
    // Phase 2: fuzzy Levenshtein fallback (query.length >= 3 only)
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
    onSearch(query, new Set()) // no highlight yet — suggestion click triggers highlight
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
    <div style={{ width: '100%' }}>
      {/* Input row */}
      <div style={{ position: 'relative', width: '100%' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Station suchen…"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 0,
            color: '#c9d8e8',
            fontSize: 13,
            padding: '7px 28px 7px 10px',
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            outline: 'none',
          }}
          onFocus={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.25)' }}
          onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.12)' }}
        />
        {inputValue && (
          <button
            onClick={handleClear}
            style={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: 'rgba(138,180,212,0.6)',
              cursor: 'pointer',
              fontSize: 14,
              padding: 0,
              lineHeight: 1,
            }}
            aria-label="Suche löschen"
          >
            ×
          </button>
        )}
      </div>

      {/* Fuzzy suggestions */}
      {suggestions.length > 0 && (
        <div
          style={{
            marginTop: 6,
            fontSize: 11,
            color: 'rgba(138,180,212,0.7)',
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
          }}
        >
          {suggestions.map((station) => (
            <div key={station.stationIndex} style={{ marginBottom: 3 }}>
              Meinst du:{' '}
              <span
                onClick={() => handleSuggestionClick(station)}
                style={{
                  color: '#c9d8e8',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  textDecorationColor: 'rgba(201,216,232,0.4)',
                }}
              >
                {station.name}
              </span>
              ?
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
