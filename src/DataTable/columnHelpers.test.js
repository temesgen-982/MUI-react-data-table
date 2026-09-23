import { describe, it, expect } from 'vitest'
import {
  descendingComparator,
  getComparator,
  columnWidthStyle,
} from './columnHelpers.js'

describe('descendingComparator', () => {
  it('returns -1 when a > b by orderBy field', () => {
    expect(descendingComparator({ age: 30 }, { age: 20 }, 'age')).toBe(-1)
  })

  it('returns 1 when a < b by orderBy field', () => {
    expect(descendingComparator({ age: 20 }, { age: 30 }, 'age')).toBe(1)
  })

  it('returns 0 when values are equal', () => {
    expect(descendingComparator({ age: 20 }, { age: 20 }, 'age')).toBe(0)
  })

  it('uses getValue when provided instead of orderBy field', () => {
    const getValue = (row) => row.info.age
    expect(
      descendingComparator({ info: { age: 30 } }, { info: { age: 20 } }, 'age', getValue),
    ).toBe(-1)
    expect(
      descendingComparator({ info: { age: 20 } }, { info: { age: 30 } }, 'age', getValue),
    ).toBe(1)
    expect(
      descendingComparator({ info: { age: 25 } }, { info: { age: 25 } }, 'age', getValue),
    ).toBe(0)
  })
})

describe('getComparator', () => {
  const a = { score: 10 }
  const b = { score: 20 }

  it("returns descending comparator for order 'desc'", () => {
    const comparator = getComparator('desc', 'score')
    expect(comparator(a, b)).toBe(1)
    expect(comparator(b, a)).toBe(-1)
  })

  it("returns ascending (negated) comparator for order 'asc'", () => {
    const comparator = getComparator('asc', 'score')
    expect(comparator(a, b)).toBe(-1)
    expect(comparator(b, a)).toBe(1)
  })

  it('passes getValue through', () => {
    const comparator = getComparator('asc', 'score', (row) => row.score)
    expect(comparator(a, b)).toBe(-1)
  })
})

describe('columnWidthStyle', () => {
  it('returns empty object when width and minWidth are undefined', () => {
    expect(columnWidthStyle({ id: 'name' })).toEqual({})
  })

  it('includes width when defined', () => {
    expect(columnWidthStyle({ width: 200 })).toEqual({ width: 200 })
  })

  it('includes minWidth when defined', () => {
    expect(columnWidthStyle({ minWidth: 100 })).toEqual({ minWidth: 100 })
  })

  it('includes both width and minWidth when defined', () => {
    expect(columnWidthStyle({ width: 200, minWidth: 100 })).toEqual({
      width: 200,
      minWidth: 100,
    })
  })
})
