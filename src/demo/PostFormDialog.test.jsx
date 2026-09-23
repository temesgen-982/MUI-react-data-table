import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PostFormDialog from './PostFormDialog.jsx'

const post = { id: 7, title: 'Original title', body: 'Original body' }
const users = [
  { id: 1, firstName: 'Alice', lastName: 'Adams' },
  { id: 2, firstName: 'Bob', lastName: 'Brown' },
]

function renderForm(props = {}) {
  const onSave = vi.fn()
  const onClose = vi.fn()
  render(
    <PostFormDialog
      post={post}
      users={users}
      onClose={onClose}
      onSave={onSave}
      saving={false}
      error={null}
      {...props}
    />,
  )
  return { onSave, onClose }
}

describe('PostFormDialog (edit mode)', () => {
  it('shows the edit heading and button labels', () => {
    renderForm()
    expect(screen.getByText('Edit post')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save Post' })).toBeInTheDocument()
  })

  it('prefills title and body from the post', () => {
    renderForm()
    expect(screen.getByLabelText('Title')).toHaveValue('Original title')
    expect(screen.getByLabelText('Body')).toHaveValue('Original body')
  })

  it('does not render the author field in edit mode', () => {
    renderForm()
    expect(screen.queryByLabelText('Author')).not.toBeInTheDocument()
  })

  it('calls onSave with trimmed values', async () => {
    const user = userEvent.setup()
    const { onSave } = renderForm()

    const title = screen.getByLabelText('Title')
    await user.clear(title)
    await user.type(title, 'Updated title')

    await user.click(screen.getByRole('button', { name: 'Save Post' }))
    expect(onSave).toHaveBeenCalledWith({
      title: 'Updated title',
      body: 'Original body',
    })
  })

  it('disables Save while saving and shows the saving label', () => {
    renderForm({ saving: true })
    const saveButton = screen.getByRole('button', { name: 'Saving…' })
    expect(saveButton).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
  })

  it('disables Save while either field is empty', () => {
    renderForm({ post: { id: 7, title: '', body: 'some body' } })
    expect(screen.getByRole('button', { name: 'Save Post' })).toBeDisabled()
  })

  it('renders the error message', () => {
    renderForm({ error: 'Request failed with status 500' })
    expect(screen.getByRole('alert')).toHaveTextContent('Request failed with status 500')
  })

  it('calls onClose from Cancel', async () => {
    const user = userEvent.setup()
    const { onClose } = renderForm()
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onClose).toHaveBeenCalled()
  })

  it('passes fields through within the dialog', () => {
    renderForm()
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByLabelText('Title')).toBeInTheDocument()
  })
})

describe('PostFormDialog (create mode)', () => {
  function renderCreate(props = {}) {
    const onSave = vi.fn()
    const onClose = vi.fn()
    render(
      <PostFormDialog
        post={null}
        users={users}
        onClose={onClose}
        onSave={onSave}
        saving={false}
        error={null}
        {...props}
      />,
    )
    return { onSave, onClose }
  }

  it('shows the create heading and button label', () => {
    renderCreate()
    expect(screen.getByText('Create post')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Post' })).toBeInTheDocument()
  })

  it('shows the author autocomplete with the first user preselected', () => {
    renderCreate()
    expect(screen.getByLabelText('Author')).toHaveValue('Alice Adams')
  })

  it('calls onSave with the entered values and selected user', async () => {
    const user = userEvent.setup()
    const { onSave } = renderCreate()

    await user.type(screen.getByLabelText('Title'), 'Fresh post')
    await user.type(screen.getByLabelText('Body'), 'Fresh body')

    const author = screen.getByLabelText('Author')
    await user.click(author)
    await user.click(await screen.findByRole('option', { name: 'Bob Brown' }))

    await user.click(screen.getByRole('button', { name: 'Create Post' }))
    expect(onSave).toHaveBeenCalledWith({
      title: 'Fresh post',
      body: 'Fresh body',
      userId: 2,
    })
  })

  it('filters the author list as the user types', async () => {
    const user = userEvent.setup()
    renderCreate()

    const author = screen.getByLabelText('Author')
    await user.click(author)
    await user.clear(author)
    await user.type(author, 'Bob')

    expect(await screen.findByRole('option', { name: 'Bob Brown' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Alice Adams' })).not.toBeInTheDocument()
  })

  it('shows the creating label while saving', () => {
    renderCreate({ saving: true })
    expect(screen.getByRole('button', { name: 'Creating…' })).toBeDisabled()
  })

  it('disables Save while users are still loading', () => {
    renderCreate({ users: null })
    expect(screen.getByRole('button', { name: 'Create Post' })).toBeDisabled()
    expect(screen.getByText('Loading authors…')).toBeInTheDocument()
  })
})