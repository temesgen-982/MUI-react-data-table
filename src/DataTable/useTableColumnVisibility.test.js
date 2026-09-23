import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTableColumnVisibility } from './useTableColumnVisibility.js'

describe('useTableColumnVisibility', () => {
  it('starts with no hidden columns by default', () => {
    const { result } = renderHook(() => useTableColumnVisibility())
    expect(result.current.hiddenColumnIds.size).toBe(0)
  })

  it('initializes from defaultHiddenColumnIds', () => {
    const { result } = renderHook(() =>
      useTableColumnVisibility(['views', 'date']),
    )
    expect(result.current.hiddenColumnIds.has('views')).toBe(true)
    expect(result.current.hiddenColumnIds.has('date')).toBe(true)
    expect(result.current.hiddenColumnIds.size).toBe(2)
  })

  it('hides a visible column', () => {
    const { result } = renderHook(() => useTableColumnVisibility())
    act(() => result.current.handleToggleColumn('views'))
    expect(result.current.hiddenColumnIds.has('views')).toBe(true)
  })

  it('unhides a hidden column', () => {
    const { result } = renderHook(() =>
      useTableColumnVisibility(['views']),
    )
    act(() => result.current.handleToggleColumn('views'))
    expect(result.current.hiddenColumnIds.has('views')).toBe(false)
    expect(result.current.hiddenColumnIds.size).toBe(0)
  })

  it('returns a new Set instance on toggle', () => {
    const { result } = renderHook(() => useTableColumnVisibility())
    const before = result.current.hiddenColumnIds
    act(() => result.current.handleToggleColumn('views'))
    expect(result.current.hiddenColumnIds).not.toBe(before)
    expect(result.current.hiddenColumnIds).toBeInstanceOf(Set)
  })
})
