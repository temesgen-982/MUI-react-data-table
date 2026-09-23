import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import PostComments from './PostComments.jsx'
import { server } from '../test/msw.js'
import { resetStore, requestLog } from './mocks/handlers.js'

const comments = [
  {
    id: 1,
    body: 'Great post!',
    likes: 4,
    user: { id: 101, username: 'carol', fullName: 'Carol Dan' },
  },
  {
    id: 2,
    body: 'Interesting read.',
    likes: 1,
    user: { id: 102, username: 'dave', fullName: 'Dave Eri' },
  },
]

describe('PostComments', () => {
  beforeEach(() => {
    resetStore({ commentsByPost: { 7: comments } })
  })

  it('fetches and renders comments for the post', async () => {
    render(<PostComments postId={7} />)

    expect(await screen.findByText('Comments (2)')).toBeInTheDocument()
    expect(screen.getByText('Great post!')).toBeInTheDocument()
    expect(screen.getByText('Interesting read.')).toBeInTheDocument()
    expect(screen.getByText('Carol Dan')).toBeInTheDocument()
    expect(screen.getByText('4 likes')).toBeInTheDocument()
    expect(requestLog).toContainEqual({
      method: 'GET',
      url: 'https://dummyjson.com/posts/7/comments',
    })
  })

  it('shows a retry button and message when the request fails', async () => {
    server.use(
      http.get('https://dummyjson.com/posts/7/comments', () =>
        HttpResponse.error(),
      ),
    )
    render(<PostComments postId={7} />)

    await screen.findByRole('button', { name: 'Retry' })
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument()
  })

  it('retries the request after clicking Retry', async () => {
    let attempts = 0
    server.use(
      http.get('https://dummyjson.com/posts/7/comments', () => {
        attempts += 1
        if (attempts === 1) {
          return HttpResponse.error()
        }
        return HttpResponse.json({ comments })
      }),
    )

    const user = userEvent.setup()
    render(<PostComments postId={7} />)

    await user.click(await screen.findByRole('button', { name: 'Retry' }))
    expect(await screen.findByText('Great post!')).toBeInTheDocument()
  })
})