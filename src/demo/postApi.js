const BASE_URL = 'https://dummyjson.com/posts';

async function request(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }
  return res.json();
}

export function updatePost(id, { title, body }) {
  return request(`${BASE_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, body }),
  });
}

export function createPost({ title, body, userId }) {
  return request(`${BASE_URL}/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, body, userId }),
  });
}

export function deletePost(id) {
  return request(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchComments(postId) {
  const data = await request(`${BASE_URL}/${postId}/comments`);
  return data.comments ?? [];
}

const usersCache = new Map();

export async function fetchUsers() {
  if (usersCache.has('all')) {
    return usersCache.get('all');
  }
  const data = await request(
    'https://dummyjson.com/users?limit=100&select=id,firstName,lastName,image',
  );
  const users = data.users ?? [];
  usersCache.set('all', users);
  return users;
}