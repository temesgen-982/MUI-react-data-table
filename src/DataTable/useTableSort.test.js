import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTableSort } from './useTableSort.js'

describe('useTableSort', () => {
  it('initializes with the provided defaults', () => {
    const { result } = renderHook(() => useTableSort('name', 'asc'))
    expect(result.current.order).toBe('asc')
    expect(result.current.orderBy).toBe('name')
  })

  it('defaults order to asc when not provided', () => {
    const { result } = renderHook(() => useTableSort('name'))
    expect(result.current.order).toBe('asc')
    expect(result.current.orderBy).toBe('name')
  })

  it('sorts ascending when clicking a different column', () => {
    const { result } = renderHook(() => useTableSort('name', 'desc'))
    act(() => result.current.handleRequestSort(null, 'age'))
    expect(result.current.order).toBe('asc')
    expect(result.current.orderBy).toBe('age')
  })

  it('toggles to descending when clicking the active ascending column', () => {
    const { result } = renderHook(() => useTableSort('name', 'asc'))
    act(() => result.current.handleRequestSort(null, 'name'))
    expect(result.current.order).toBe('desc')
    expect(result.current.orderBy).toBe('name')
  })

  it('toggles back to ascending when clicking the active descending column', () => {
    const { result } = renderHook(() => useTableSort('name', 'asc'))
    act(() => result.current.handleRequestSort(null, 'name'))
    act(() => result.current.handleRequestSort(null, 'name'))
    expect(result.current.order).toBe('asc')
    expect(result.current.orderBy).toBe('name')
  })
})
