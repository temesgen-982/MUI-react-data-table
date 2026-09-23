import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTablePagination } from './useTablePagination.js'

describe('useTablePagination', () => {
  it('initializes with page 0 and default rows per page', () => {
    const { result } = renderHook(() => useTablePagination(10))
    expect(result.current.page).toBe(0)
    expect(result.current.rowsPerPage).toBe(10)
  })

  it('defaults rows per page to 5 when not provided', () => {
    const { result } = renderHook(() => useTablePagination())
    expect(result.current.rowsPerPage).toBe(5)
  })

  it('handleChangePage sets the page', () => {
    const { result } = renderHook(() => useTablePagination())
    act(() => result.current.handleChangePage(null, 2))
    expect(result.current.page).toBe(2)
  })

  it('handleChangeRowsPerPage parses the value and resets page to 0', () => {
    const { result } = renderHook(() => useTablePagination())
    act(() => result.current.handleChangePage(null, 3))
    act(() => result.current.handleChangeRowsPerPage({ target: { value: '20' } }))
    expect(result.current.rowsPerPage).toBe(20)
    expect(result.current.page).toBe(0)
  })
})
