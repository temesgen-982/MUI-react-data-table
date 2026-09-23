import { describe, it, expect, vi, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTableExport } from './useTableExport.js'

const columns = [
  { id: 'title', label: 'Title' },
  { id: 'views', label: 'Views' },
  { id: 'actions', label: 'Actions', exportable: false },
]
const rows = [
  { id: 1, title: 'Post A', views: 10 },
  { id: 2, title: 'Post B', views: 20 },
]

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useTableExport', () => {
  it('excludes columns with exportable false from the CSV', async () => {
    let capturedBlob = null
    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
      capturedBlob = blob
      return 'blob:mock'
    })
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    const { result } = renderHook(() => useTableExport())
    act(() => result.current.handleExport(columns, rows, 'posts.csv'))

    const csv = await capturedBlob.text()
    expect(csv).toBe('Title,Views\nPost A,10\nPost B,20')
  })

  it('includes all columns that do not opt out', async () => {
    let capturedBlob = null
    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
      capturedBlob = blob
      return 'blob:mock'
    })
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    const { result } = renderHook(() => useTableExport())
    act(() => result.current.handleExport(columns.slice(0, 2), rows))

    const csv = await capturedBlob.text()
    expect(csv).toBe('Title,Views\nPost A,10\nPost B,20')
  })
})