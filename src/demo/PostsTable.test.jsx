import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor, within, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import PostsTable from './PostsTable.jsx'
import ToastProvider from '../ToastProvider.jsx'
import { server } from '../test/msw.js'
import { requestLog, recordRequest } from './mocks/handlers.js'
import { clearUsersCache } from './postApi.js'

const renderPosts = () => render(<ToastProvider><PostsTable /></ToastProvider>)

beforeEach(() => {
  clearUsersCache()
})

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

  it('removes a created post from the table after it is deleted', async () => {
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
    await user.type(within(dialog).getByLabelText('Title'), 'Fresh post')
    await user.type(within(dialog).getByLabelText('Body'), 'Fresh body')
    await user.click(within(dialog).getByRole('button', { name: 'Create Post' }))
    await act(async () => {
      resolveAdd()
      await addPending
    })
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(await screen.findByText('Fresh post')).toBeInTheDocument()

    await user.click(screen.getAllByRole('button', { name: 'delete post' })[0])
    const confirmDialog = await screen.findByRole('dialog')
    await user.click(within(confirmDialog).getByRole('button', { name: 'Delete' }))

    expect(await screen.findByText('Post deleted')).toBeInTheDocument()
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    await waitFor(() =>
      expect(screen.queryByText('Fresh post')).not.toBeInTheDocument(),
    )
    expect(screen.getByText('Banana post')).toBeInTheDocument()
  })

  it('recovers from a user-loading failure in the create form', async () => {
    const user = userEvent.setup()
    let fail = true
    server.use(
      http.get('https://dummyjson.com/users', () => {
        if (fail) {
          return HttpResponse.error()
        }
        return HttpResponse.json({
          users: [{ id: 1, firstName: 'Alice', lastName: 'Adams', image: '' }],
          total: 1,
        })
      }),
    )

    renderPosts()
    await screen.findByText('Banana post')
    await user.click(screen.getByRole('button', { name: 'create post' }))

    const dialog = await screen.findByRole('dialog')
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(/failed/i)
    expect(within(dialog).getByLabelText('Author')).toBeDisabled()

    fail = false
    await user.click(within(dialog).getByRole('button', { name: 'Retry' }))

    await waitFor(() =>
      expect(within(dialog).queryByRole('alert')).not.toBeInTheDocument(),
    )
    expect(within(dialog).getByLabelText('Author')).toBeEnabled()
  })

  it('does not subtract deletions from other queries totals', async () => {
    const user = userEvent.setup()
    server.use(
      http.get('https://dummyjson.com/posts/search', ({ request }) => {
        recordRequest(request)
        return HttpResponse.json({
          posts: [
            {
              id: 2,
              title: 'Apple post',
              body: 'Body two',
              tags: ['life'],
              reactions: { likes: 2, dislikes: 1 },
              views: 20,
              userId: 102,
            },
          ],
          total: 1,
        })
      }),
    )

    renderPosts()
    await screen.findByText('Banana post')
    await user.click(screen.getAllByRole('button', { name: 'delete post' })[0])

    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )
    expect(screen.getByText('1–1 of 1')).toBeInTheDocument()

    await user.type(screen.getByRole('textbox', { name: 'Search posts…' }), 'Apple')

    await waitFor(() =>
      expect(screen.getByText('1–1 of 1')).toBeInTheDocument(),
    )
    expect(screen.queryByText('1–1 of 0')).not.toBeInTheDocument()
  })

  it('clears the previous delete error when reopening the confirm dialog', async () => {
    const user = userEvent.setup()
    server.use(
      http.delete('https://dummyjson.com/posts/1', ({ request }) => {
        recordRequest(request)
        return HttpResponse.json({ message: 'boom' }, { status: 500 })
      }),
    )

    renderPosts()
    await screen.findByText('Banana post')
    await user.click(screen.getAllByRole('button', { name: 'delete post' })[0])

    let dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Delete' }))
    expect(await within(dialog).findByRole('alert')).toHaveTextContent(/failed/i)

    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    )

    await user.click(screen.getAllByRole('button', { name: 'delete post' })[0])
    dialog = await screen.findByRole('dialog')
    expect(within(dialog).queryByRole('alert')).not.toBeInTheDocument()
  })
})