import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import DataTableToolbar from './DataTableToolbar.jsx'

const columns = [
  { id: 'title', label: 'Title' },
  { id: 'views', label: 'Views' },
]

function renderToolbar(props = {}) {
  const onToggleColumn = vi.fn()
  const onToggleDense = vi.fn()
  const onExport = vi.fn()
  const onDelete = vi.fn()
  render(
    <DataTableToolbar
      title="Posts"
      titleId="posts-title"
      numSelected={0}
      columns={columns}
      hiddenColumnIds={new Set()}
      onToggleColumn={onToggleColumn}
      dense={false}
      onToggleDense={onToggleDense}
      onExport={onExport}
      onDelete={onDelete}
      enableColumnVisibility
      enableDense
      enableExport
      {...props}
    />,
  )
  return { onToggleColumn, onToggleDense, onExport, onDelete }
}

function SearchHarness({ onSearchChangeSpy, ...props }) {
  const [value, setValue] = useState('')
  return (
    <DataTableToolbar
      title="Posts"
      titleId="posts-title"
      numSelected={0}
      columns={columns}
      hiddenColumnIds={new Set()}
      enableSearch
      searchValue={value}
      onSearchChange={(next) => {
        setValue(next)
        onSearchChangeSpy(next)
      }}
      {...props}
    />
  )
}

describe('DataTableToolbar', () => {
  it('renders the title', () => {
    renderToolbar()
    expect(screen.getByText('Posts')).toBeInTheDocument()
  })

  it('shows the number of selected rows and calls onDelete', async () => {
    const user = userEvent.setup()
    const { onDelete } = renderToolbar({ numSelected: 3 })
    expect(screen.getByText('3 selected')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'delete' }))
    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('hides the delete button when onDelete is not provided', () => {
    renderToolbar({ numSelected: 3, onDelete: undefined })
    expect(screen.queryByRole('button', { name: 'delete' })).not.toBeInTheDocument()
  })

  it('calls onToggleDense from the dense button', async () => {
    const user = userEvent.setup()
    const { onToggleDense } = renderToolbar()
    await user.click(screen.getByRole('button', { name: 'toggle dense padding' }))
    expect(onToggleDense).toHaveBeenCalledTimes(1)
  })

  it('calls onExport from the export button', async () => {
    const user = userEvent.setup()
    const { onExport } = renderToolbar()
    await user.click(screen.getByRole('button', { name: 'export CSV' }))
    expect(onExport).toHaveBeenCalledTimes(1)
  })

  it('opens the columns menu and toggles a column', async () => {
    const user = userEvent.setup()
    const { onToggleColumn } = renderToolbar()
    await user.click(screen.getByRole('button', { name: 'columns visibility' }))
    const menu = await screen.findByRole('menu')
    await user.click(within(menu).getByRole('menuitem', { name: 'Views' }))
    expect(onToggleColumn).toHaveBeenCalledWith('views')
  })

  it('reflects hidden columns as unchecked in the menu', async () => {
    const user = userEvent.setup()
    renderToolbar({ hiddenColumnIds: new Set(['views']) })
    await user.click(screen.getByRole('button', { name: 'columns visibility' }))
    const menu = await screen.findByRole('menu')
    const titleItem = within(menu).getByRole('menuitem', { name: 'Title' })
    const viewsItem = within(menu).getByRole('menuitem', { name: 'Views' })
    expect(within(titleItem).getByRole('checkbox')).toBeChecked()
    expect(within(viewsItem).getByRole('checkbox')).not.toBeChecked()
  })

  it('search input calls onSearchChange as the user types', async () => {
    const user = userEvent.setup()
    const onSearchChangeSpy = vi.fn()
    render(<SearchHarness onSearchChangeSpy={onSearchChangeSpy} />)
    const input = screen.getByLabelText('Search…')
    await user.type(input, 'hello')
    expect(onSearchChangeSpy).toHaveBeenLastCalledWith('hello')
    expect(input).toHaveValue('hello')
  })

  it('clear search resets the value via onSearchChange', async () => {
    const user = userEvent.setup()
    const onSearchChangeSpy = vi.fn()
    render(<SearchHarness onSearchChangeSpy={onSearchChangeSpy} />)
    await user.type(screen.getByLabelText('Search…'), 'hello')
    await user.click(screen.getByRole('button', { name: 'clear search' }))
    expect(onSearchChangeSpy).toHaveBeenLastCalledWith('')
    expect(screen.getByLabelText('Search…')).toHaveValue('')
  })
})
