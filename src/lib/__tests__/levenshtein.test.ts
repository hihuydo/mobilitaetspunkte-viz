import { describe, it, expect } from 'vitest'
import { levenshtein } from '../levenshtein'

describe('levenshtein', () => {
  it('returns 0 for identical strings', () => {
    expect(levenshtein('freiheit', 'freiheit')).toBe(0)
  })
  it('returns string length when other is empty', () => {
    expect(levenshtein('abc', '')).toBe(3)
    expect(levenshtein('', 'abc')).toBe(3)
  })
  it('counts single substitution', () => {
    expect(levenshtein('kitten', 'sitten')).toBe(1)
  })
  it('counts substitution + insertion', () => {
    // "fryhait"→"freiheit": DP yields 3
    expect(levenshtein('fryhait', 'freiheit')).toBe(3)
  })
  it('is case-sensitive (callers lowercase before calling)', () => {
    expect(levenshtein('A', 'a')).toBe(1)
  })
})
