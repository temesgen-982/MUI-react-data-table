import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useServerDataTable } from './useServerDataTable.js'

beforeEach(() => {
  window.history.replaceState({}, '', '/')
})

describe('useServerDataTable', () => {
  it('loads data on mount', async () => {
    const fetchFn = vi.fn().mockResolvedValue({
      data: [{ id: 1, title: 'a' }],
      total: 1,
    })
    const { result } = renderHook(() => useServerDataTable({ fetchFn }))

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toEqual([])
    expect(fetchFn).toHaveBeenCalledWith({ page: 0, limit: 5 })

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual([{ id: 1, title: 'a' }])
    expect(result.current.totalCount).toBe(1)
    expect(result.current.error).toBeNull()
  })

  it('sets error when fetch rejects', async () => {
    const err = new Error('network down')
    const fetchFn = vi.fn().mockRejectedValue(err)
    const { result } = renderHook(() => useServerDataTable({ fetchFn }))

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe(err)
    expect(result.current.data).toEqual([])
    expect(result.current.totalCount).toBe(0)
  })

  it('setQuery resets page to default, sets loading, and fetches with merged query', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ data: [], total: 0 })
    const { result } = renderHook(() => useServerDataTable({ fetchFn }))

    await waitFor(() => expect(result.current.loading).toBe(false))

    act(() => result.current.handleChangePage(null, 1))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.page).toBe(1)
    expect(window.location.search).toBe('?page=1')

    act(() => result.current.setQuery({ q: 'apple' }))
    expect(result.current.loading).toBe(true)
    expect(result.current.page).toBe(0)

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.query).toEqual({ q: 'apple' })
    expect(fetchFn).toHaveBeenLastCalledWith({ page: 0, limit: 5, q: 'apple' })
    expect(window.location.search).toBe('')
  })

  it('discards stale responses (race protection)', async () => {
    let resolveFirst
    const firstPromise = new Promise((resolve) => {
      resolveFirst = resolve
    })
    const fetchFn = vi
      .fn()
      .mockImplementationOnce(() => firstPromise)
      .mockResolvedValueOnce({ data: [{ id: 2 }], total: 2 })

    const { result } = renderHook(() => useServerDataTable({ fetchFn }))
    expect(fetchFn).toHaveBeenCalledTimes(1)

    act(() => result.current.setQuery({ q: 'apple' }))
    expect(fetchFn).toHaveBeenCalledTimes(2)

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual([{ id: 2 }])
    expect(result.current.totalCount).toBe(2)

    await act(async () => {
      resolveFirst({ data: [{ id: 1 }], total: 99 })
      await firstPromise
    })

    expect(result.current.data).toEqual([{ id: 2 }])
    expect(result.current.totalCount).toBe(2)
    expect(result.current.loading).toBe(false)
  })

  it('handleChangeRowsPerPage parses value, resets page to 0, and refetches', async () => {
    const fetchFn = vi.fn().mockResolvedValue({ data: [], total: 0 })
    const { result } = renderHook(() => useServerDataTable({ fetchFn }))

    await waitFor(() => expect(result.current.loading).toBe(false))
    act(() => result.current.handleChangePage(null, 1))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.page).toBe(1)

    act(() => result.current.handleChangeRowsPerPage({ target: { value: '10' } }))
    expect(result.current.rowsPerPage).toBe(10)
    expect(result.current.page).toBe(0)
    expect(result.current.loading).toBe(true)

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(fetchFn).toHaveBeenLastCalledWith({ page: 0, limit: 10 })
    expect(window.location.search).toBe('?limit=10')
  })
})
