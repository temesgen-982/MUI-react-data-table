import { describe, it, expect } from 'vitest'
import { render, screen, waitFor, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import PostsTable from './PostsTable.jsx'
import ToastProvider from '../ToastProvider.jsx'
import { server } from '../test/msw.js'
import { requestLog, recordRequest } from './mocks/handlers.js'

const renderPosts = () => render(<ToastProvider><PostsTable /></ToastProvider>)

describe('PostsTable', () => {
  it('renders posts with edit and delete actions', async () => {
    renderPosts()

    expect(await screen.findByText('Banana post')).toBeInTheDocument()
    expect(screen.getByText('Apple post')).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'edit post' })).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: 'delete post' })).toHaveLength(2)
  })

  it('edits a post through the dialog, shows the loading state, and hits the API', async () => {
    const user = userEvent.setup()
    let resolvePut
    const putPending = new Promise((resolve) => {
      resolvePut = resolve
    })
    server.use(
      http.put('https://dummyjson.com/posts/1', async ({ request }) => {
        const body = await request.json()
        recordRequest(request, body)
        await putPending
        return HttpResponse.json({ id: 1, title: body.title, body: body.body })
      }),
    )

    renderPosts()

    await screen.findByText('Banana post')
    await user.click(screen.getAllByRole('button', { name: 'edit post' })[0])

    const dialog = await screen.findByRole('dialog')
    const titleInput = within(dialog).getByLabelText('Title')
    await user.clear(titleInput)
    await user.type(titleInput, 'Updated banana')
    await user.click(within(dialog).getByRole('button', { name: 'Save Post' }))

    expect(await within(dialog).findByRole('button', { name: 'Saving…' })).toBeDisabled()
    expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeDisabled()
    await waitFor(() =>
      expect(requestLog).toContainEqual({
        method: 'PUT',
        url: 'https://dummyjson.com/posts/1',
        body: { title: 'Updated banana', body: 'Body one' },
      }),
    )

    await act(async () => {
      resolvePut()
      await putPending
    })

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(screen.getByText('Updated banana')).toBeInTheDocument()
    expect(await screen.findByText('Post updated')).toBeInTheDocument()
    expect(screen.getByTestId('CheckCircleIcon')).toBeInTheDocument()
  })

  it('creates a post through the dialog, hits the API, and shows the loading state', async () => {
    const user = userEvent.setup()
    let resolveAdd
    const addPending = new Promise((resolve) => {
      resolveAdd = resolve
    })
    server.use(
      http.post('https://dummyjson.com/posts/add', async ({ request }) => {
        const body = await request.json()
        recordRequest(request, body)
        await addPending
        return HttpResponse.json({ id: 999, title: body.title, body, userId: body.userId })
      }),
    )

    renderPosts()
    await screen.findByText('Banana post')
    await user.click(screen.getByRole('button', { name: 'create post' }))

    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText('Title'), 'Brand new post')
    await user.type(within(dialog).getByLabelText('Body'), 'Fresh body content')
    await waitFor(() =>
      expect(within(dialog).getByLabelText('Author')).toHaveValue('Alice Adams'),
    )

    await user.click(within(dialog).getByRole('button', { name: 'Create Post' }))

    expect(await within(dialog).findByRole('button', { name: 'Creating…' })).toBeDisabled()
    expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeDisabled()
    await waitFor(() =>
      expect(requestLog).toContainEqual({
        method: 'POST',
        url: 'https://dummyjson.com/posts/add',
        body: { title: 'Brand new post', body: 'Fresh body content', userId: 1 },
      }),
    )

    await act(async () => {
      resolveAdd()
      await addPending
    })

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(await screen.findByText('Post created')).toBeInTheDocument()
    expect(screen.getByTestId('CheckCircleIcon')).toBeInTheDocument()
  })

  it('deletes a post after confirmation', async () => {
    const user = userEvent.setup()
    renderPosts()

    await screen.findByText('Banana post')
    await user.click(screen.getAllByRole('button', { name: 'delete post' })[0])

    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/Are you sure/)).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))

    await waitFor(() =>
      expect(screen.queryByText('Banana post')).not.toBeInTheDocument(),
    )
    expect(screen.getByText('Apple post')).toBeInTheDocument()
    expect(requestLog).toContainEqual({
      method: 'DELETE',
      url: 'https://dummyjson.com/posts/1',
    })
    expect(await screen.findByText('Post deleted')).toBeInTheDocument()
    expect(screen.getByTestId('CheckCircleIcon')).toBeInTheDocument()
  })

  it('shows comments in the expanded row', async () => {
    const user = userEvent.setup()
    renderPosts()

    await screen.findByText('Banana post')
    await user.click(screen.getAllByRole('button', { name: 'expand row' })[0])

    expect(await screen.findByText('Nice post!')).toBeInTheDocument()
    expect(screen.getByText('Comments (1)')).toBeInTheDocument()
    expect(screen.getByText('Carol Dan')).toBeInTheDocument()
  })
})