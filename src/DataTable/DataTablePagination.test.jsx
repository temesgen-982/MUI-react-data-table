import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DataTablePagination from './DataTablePagination.jsx'

function renderPagination(props = {}) {
  const onPageChange = vi.fn()
  render(
    <DataTablePagination
      count={25}
      page={0}
      rowsPerPage={10}
      onPageChange={onPageChange}
      {...props}
    />,
  )
  return { onPageChange }
}

describe('DataTablePagination', () => {
  it('disables first and previous on the first page', () => {
    renderPagination({ page: 0 })
    expect(screen.getByRole('button', { name: 'first page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'previous page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'next page' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'last page' })).toBeEnabled()
  })

  it('enables all buttons on a middle page', () => {
    renderPagination({ page: 1 })
    expect(screen.getByRole('button', { name: 'first page' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'previous page' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'next page' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'last page' })).toBeEnabled()
  })

  it('disables next and last on the last page', () => {
    // count 25 / rowsPerPage 10 → 3 pages, last page index 2
    renderPagination({ page: 2 })
    expect(screen.getByRole('button', { name: 'first page' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'previous page' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'next page' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'last page' })).toBeDisabled()
  })

  it('calls onPageChange with the next page', async () => {
    const user = userEvent.setup()
    const { onPageChange } = renderPagination({ page: 1 })
    await user.click(screen.getByRole('button', { name: 'next page' }))
    expect(onPageChange).toHaveBeenCalledTimes(1)
    expect(onPageChange.mock.calls[0][1]).toBe(2)
  })

  it('calls onPageChange with the previous page', async () => {
    const user = userEvent.setup()
    const { onPageChange } = renderPagination({ page: 1 })
    await user.click(screen.getByRole('button', { name: 'previous page' }))
    expect(onPageChange.mock.calls[0][1]).toBe(0)
  })

  it('calls onPageChange with 0 for first page', async () => {
    const user = userEvent.setup()
    const { onPageChange } = renderPagination({ page: 2 })
    await user.click(screen.getByRole('button', { name: 'first page' }))
    expect(onPageChange.mock.calls[0][1]).toBe(0)
  })

  it('calls onPageChange with the last page index for last page', async () => {
    const user = userEvent.setup()
    const { onPageChange } = renderPagination({ page: 0 })
    await user.click(screen.getByRole('button', { name: 'last page' }))
    expect(onPageChange.mock.calls[0][1]).toBe(2)
  })
})
