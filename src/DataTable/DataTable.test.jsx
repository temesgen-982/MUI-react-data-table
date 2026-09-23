import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DataTable from './DataTable.jsx'

const columns = [
  { id: 'title', label: 'Title' },
  { id: 'views', label: 'Views', numeric: true },
]
const data = [
  { id: 1, title: 'Banana', views: 10 },
  { id: 2, title: 'Apple', views: 20 },
]
const getRowId = (row) => row.id

function renderTable(props = {}) {
  return render(
    <DataTable
      columns={columns}
      data={data}
      getRowId={getRowId}
      title="Posts"
      {...props}
    />,
  )
}

function getBodyTexts(container) {
  return [...container.querySelectorAll('tbody tr')].map((tr) =>
    tr.textContent,
  )
}

describe('DataTable', () => {
  it('renders the table with its title and rows', () => {
    renderTable()
    expect(screen.getByRole('table', { name: 'Posts' })).toBeInTheDocument()
    expect(screen.getByText('Banana')).toBeInTheDocument()
    expect(screen.getByText('Apple')).toBeInTheDocument()
  })

  it('sorts ascending then descending when clicking a column header', async () => {
    const user = userEvent.setup()
    const { container } = renderTable()

    await user.click(screen.getByRole('button', { name: 'Title' }))
    let texts = getBodyTexts(container)
    expect(texts[0]).toContain('Apple')
    expect(texts[1]).toContain('Banana')

    await user.click(screen.getByRole('button', { name: 'Title' }))
    texts = getBodyTexts(container)
    expect(texts[0]).toContain('Banana')
    expect(texts[1]).toContain('Apple')
  })

  it('paginates client-side rows', async () => {
    const user = userEvent.setup()
    renderTable({ defaultRowsPerPage: 1 })

    expect(screen.getByText('Banana')).toBeInTheDocument()
    expect(screen.queryByText('Apple')).not.toBeInTheDocument()
    expect(screen.getByText('1–1 of 2')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'next page' }))
    expect(screen.getByText('Apple')).toBeInTheDocument()
    expect(screen.queryByText('Banana')).not.toBeInTheDocument()
  })

  it('selects all rows via the header checkbox and shows the count in the toolbar', async () => {
    const user = userEvent.setup()
    renderTable()

    await user.click(screen.getByLabelText(/^select all/i))
    expect(screen.getByText('2 selected')).toBeInTheDocument()
    expect(screen.getByText('Apple').closest('tr')).toHaveAttribute(
      'aria-checked',
      'true',
    )
    expect(screen.getByText('Banana').closest('tr')).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })

  it('hides a column via the toolbar column-visibility menu', async () => {
    const user = userEvent.setup()
    renderTable()

    await user.click(screen.getByRole('button', { name: 'columns visibility' }))
    const menu = await screen.findByRole('menu')
    await user.click(within(menu).getByRole('menuitem', { name: 'Views' }))

    expect(
      screen.queryByRole('button', { name: 'Views' }),
    ).not.toBeInTheDocument()
    expect(screen.queryByText('10')).not.toBeInTheDocument()
    expect(screen.queryByText('20')).not.toBeInTheDocument()
    expect(screen.getByText('Banana')).toBeInTheDocument()
  })

  it('shows a progress bar when loading', () => {
    renderTable({ loading: true })
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
  })

  it('uses server-side pagination when pagination props are provided', async () => {
    const user = userEvent.setup()
    const onPageChange = vi.fn()
    const onRowsPerPageChange = vi.fn()
    renderTable({
      totalCount: 50,
      page: 0,
      rowsPerPage: 1,
      rowsPerPageOptions: [1, 5, 10],
      onPageChange,
      onRowsPerPageChange,
    })

    // server-side mode does not slice data client-side
    expect(screen.getByText('Banana')).toBeInTheDocument()
    expect(screen.getByText('Apple')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'next page' }))
    expect(onPageChange).toHaveBeenCalledTimes(1)
    expect(onPageChange.mock.calls[0][1]).toBe(1)
  })
})
