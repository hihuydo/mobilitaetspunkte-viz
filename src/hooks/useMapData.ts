// src/hooks/useMapData.ts
import { useState, useEffect, useMemo } from 'react'
import csvUrl from '../../data/mobilitaetspunkte.csv?url'
import { parseCSV } from '../lib/parseData'
import { computeMapLayout, type MapStation } from '../lib/mapLayout'

export function useMapData(svgWidth: number, svgHeight: number): {
  stations: MapStation[]
  error: string | null
} {
  const [rawCsv, setRawCsv] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(csvUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.text()
      })
      .then(setRawCsv)
      .catch((e) => setError(String(e)))
  }, [])

  const stations = useMemo(() => {
    if (!rawCsv || svgWidth === 0 || svgHeight === 0) return []
    return computeMapLayout(parseCSV(rawCsv), svgWidth, svgHeight)
  }, [rawCsv, svgWidth, svgHeight])

  return { stations, error }
}
