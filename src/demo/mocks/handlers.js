import { http, HttpResponse } from 'msw'

const BASE_POSTS = 'https://dummyjson.com/posts'
const BASE_USERS = 'https://dummyjson.com/users'

const fixtureUsers = [
  { id: 1, firstName: 'Alice', lastName: 'Adams', image: '' },
  { id: 101, firstName: 'Alice', lastName: 'Adams', image: '' },
  { id: 102, firstName: 'Bob', lastName: 'Brown', image: '' },
]

const fixturePosts = [
  {
    id: 1,
    title: 'Banana post',
    body: 'Body one',
    tags: ['history'],
    reactions: { likes: 1, dislikes: 0 },
    views: 10,
    userId: 101,
  },
  {
    id: 2,
    title: 'Apple post',
    body: 'Body two',
    tags: ['life'],
    reactions: { likes: 2, dislikes: 1 },
    views: 20,
    userId: 102,
  },
]

const fixtureCommentsByPost = {
  1: [
    {
      id: 1,
      body: 'Nice post!',
      likes: 3,
      user: { id: 201, username: 'carol', fullName: 'Carol Dan' },
    },
  ],
}

export const requestLog = []

export function clearRequestLog() {
  requestLog.length = 0
}

export function recordRequest(request, body) {
  const entry = { method: request.method, url: String(request.url) };
  if (body !== undefined) {
    entry.body = body;
  }
  requestLog.push(entry);
}

let store = {
  users: [...fixtureUsers],
  posts: [...fixturePosts],
  commentsByPost: { ...fixtureCommentsByPost },
}

export function resetStore(overrides = {}) {
  store = {
    users: overrides.users ?? [...fixtureUsers],
    posts: overrides.posts ?? [...fixturePosts],
    commentsByPost: overrides.commentsByPost ?? { ...fixtureCommentsByPost },
  }
}

const emptyList = () => HttpResponse.json({ posts: [], total: 0 })

export const handlers = [
  http.get(`${BASE_POSTS}`, ({ request }) => {
    recordRequest(request)
    return HttpResponse.json({ posts: store.posts, total: store.posts.length })
  }),
  http.get(`${BASE_POSTS}/search`, emptyList),
  http.get(`${BASE_POSTS}/user/:userId`, emptyList),
  http.get(`${BASE_POSTS}/tag/:tag`, emptyList),
  http.get(`${BASE_POSTS}/:postId/comments`, ({ request, params }) => {
    recordRequest(request)
    const comments = store.commentsByPost[Number(params.postId)] ?? []
    return HttpResponse.json({ comments })
  }),
  http.post(`${BASE_POSTS}/add`, async ({ request }) => {
    const body = await request.json()
    recordRequest(request, body)
    return HttpResponse.json({
      id: 999,
      title: body.title,
      body: body.body ?? '',
      userId: body.userId,
      tags: [],
      reactions: { likes: 0, dislikes: 0 },
      views: 0,
    })
  }),
  http.put(`${BASE_POSTS}/:postId`, async ({ request, params }) => {
    const body = await request.json()
    recordRequest(request, body)
    const existing = store.posts.find(
      (post) => post.id === Number(params.postId),
    ) ?? { id: Number(params.postId) }
    return HttpResponse.json({ ...existing, ...body })
  }),
  http.delete(`${BASE_POSTS}/:postId`, async ({ request, params }) => {
    recordRequest(request)
    return HttpResponse.json({ id: Number(params.postId), isDeleted: true })
  }),
  http.get(`${BASE_USERS}`, ({ request }) => {
    recordRequest(request)
    return HttpResponse.json({ users: store.users, total: store.users.length })
  }),
  http.get(`${BASE_USERS}/:userId`, ({ request, params }) => {
    recordRequest(request)
    const user = store.users.find((u) => u.id === Number(params.userId))
    return HttpResponse.json(
      user ?? { id: Number(params.userId), firstName: 'Unknown', lastName: 'User', image: '' },
    )
  }),
]