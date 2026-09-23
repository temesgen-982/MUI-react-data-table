import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTableSelect } from './useTableSelect.js'

const data = [
  { id: 'a', name: 'Alice' },
  { id: 'b', name: 'Bob' },
  { id: 'c', name: 'Carol' },
]
const getRowId = (row) => row.id

describe('useTableSelect', () => {
  it('starts with an empty selection', () => {
    const { result } = renderHook(() => useTableSelect(data, getRowId))
    expect(result.current.selected).toEqual([])
  })

  it('selects all rows on first handleSelectAllClick', () => {
    const { result } = renderHook(() => useTableSelect(data, getRowId))
    act(() => result.current.handleSelectAllClick())
    expect(result.current.selected).toEqual(['a', 'b', 'c'])
  })

  it('clears selection on second handleSelectAllClick', () => {
    const { result } = renderHook(() => useTableSelect(data, getRowId))
    act(() => result.current.handleSelectAllClick())
    act(() => result.current.handleSelectAllClick())
    expect(result.current.selected).toEqual([])
  })

  it('toggles an individual row on', () => {
    const { result } = renderHook(() => useTableSelect(data, getRowId))
    act(() => result.current.handleClick(null, 'b'))
    expect(result.current.selected).toEqual(['b'])
  })

  it('toggles an individual row off when already selected', () => {
    const { result } = renderHook(() => useTableSelect(data, getRowId))
    act(() => result.current.handleClick(null, 'b'))
    act(() => result.current.handleClick(null, 'b'))
    expect(result.current.selected).toEqual([])
  })

  it('clearSelection empties the selection', () => {
    const { result } = renderHook(() => useTableSelect(data, getRowId))
    act(() => result.current.handleClick(null, 'a'))
    act(() => result.current.clearSelection())
    expect(result.current.selected).toEqual([])
  })

  it('ignores select-all when enabled is false', () => {
    const { result } = renderHook(() => useTableSelect(data, getRowId, false))
    act(() => result.current.handleSelectAllClick())
    expect(result.current.selected).toEqual([])
  })

  it('ignores individual clicks when enabled is false', () => {
    const { result } = renderHook(() => useTableSelect(data, getRowId, false))
    act(() => result.current.handleClick(null, 'a'))
    expect(result.current.selected).toEqual([])
  })
})
