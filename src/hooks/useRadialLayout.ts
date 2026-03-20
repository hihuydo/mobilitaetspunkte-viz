import { useState, useEffect, useMemo } from 'react'
import csvUrl from '../../data/mobilitaetspunkte.csv?url'
import { parseCSV, groupStations } from '../lib/parseData'
import { computeLayout } from '../lib/layout'
import type { LayoutResult } from '../lib/layout'
import type { StationGroup } from '../lib/parseData'

interface UseRadialLayoutReturn {
  layout: LayoutResult | null
  groups: StationGroup[]
  error: string | null
}

export function useRadialLayout(width: number, height: number): UseRadialLayoutReturn {
  const [groups, setGroups] = useState<StationGroup[]>([])
  const [error, setError] = useState<string | null>(null)

  // Fetch and parse CSV once on mount
  useEffect(() => {
    fetch(csvUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load CSV: ${res.status}`)
        return res.text()
      })
      .then((text) => {
        const stations = parseCSV(text)
        const grouped = groupStations(stations)
        setGroups(grouped)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err))
      })
  }, [])

  // Compute layout (memoized — only reruns when groups or dimensions change)
  const layout = useMemo<LayoutResult | null>(() => {
    if (groups.length === 0 || width === 0 || height === 0) return null
    const R = Math.min(width, height) / 2
    return computeLayout(groups, R)
  }, [groups, width, height])

  return { layout, groups, error }
}
