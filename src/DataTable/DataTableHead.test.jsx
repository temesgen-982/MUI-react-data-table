import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DataTableHead from './DataTableHead.jsx'

const columns = [
  { id: 'title', label: 'Title' },
  { id: 'actions', label: 'Actions', sortable: false },
]

function renderHead(props = {}) {
  const onRequestSort = props.onRequestSort ?? vi.fn()
  render(
    <DataTableHead
      numSelected={0}
      order="asc"
      orderBy="title"
      onSelectAllClick={() => {}}
      onRequestSort={onRequestSort}
      rowCount={2}
      columns={columns}
      enableSelection
      selectionLabel="select all posts"
      {...props}
    />,
  )
  return { onRequestSort }
}

describe('DataTableHead', () => {
  it('renders a sort button for sortable columns', () => {
    renderHead()
    expect(screen.getByRole('button', { name: 'Title' })).toBeInTheDocument()
  })

  it('renders plain text (no button) for a sortable:false column', () => {
    renderHead()
    expect(screen.queryByRole('button', { name: 'Actions' })).not.toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('calls onRequestSort when a sortable header is clicked', async () => {
    const user = userEvent.setup()
    const { onRequestSort } = renderHead()
    await user.click(screen.getByRole('button', { name: 'Title' }))
    expect(onRequestSort).toHaveBeenCalledTimes(1)
    expect(onRequestSort.mock.calls[0][1]).toBe('title')
  })
})