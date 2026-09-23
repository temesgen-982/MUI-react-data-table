import { useMemo, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import DataTable, { useServerDataTable } from '../DataTable/index.js';
import UserBadge from './UserBadge.jsx';
import { updatePost, deletePost, createPost, fetchUsers } from './postApi.js';
import PostFormDialog from './PostFormDialog.jsx';
import ConfirmDeleteDialog from './ConfirmDeleteDialog.jsx';
import PostComments from './PostComments.jsx';
import { useSnackbar } from 'notistack';

const EMPTY_DELETED = new Set();

const fetchPosts = ({ page, limit, userId, tag, q }) => {
  const params = new URLSearchParams({ limit, skip: page * limit });
  let url;
  if (q) {
    params.set('q', q);
    url = `https://dummyjson.com/posts/search?${params}`;
  } else if (userId) {
    url = `https://dummyjson.com/posts/user/${userId}?${params}`;
  } else if (tag) {
    url = `https://dummyjson.com/posts/tag/${tag}?${params}`;
  } else {
    url = `https://dummyjson.com/posts?${params}`;
  }
  return fetch(url)
    .then((res) => res.json())
    .then((data) => ({ data: data.posts ?? [], total: data.total ?? 0 }));
};

const columns = [
  {
    id: 'title',
    label: 'Title',
    flex: 2,
  },
  {
    id: 'tags',
    disablePadding: true,
    label: 'Tags',
    flex: 2,
    format: (value) => value.join(', '),
    render: (tags) => (
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
        {tags.map((tag) => (
          <Chip key={tag} label={tag} size="small" variant="outlined" />
        ))}
      </Stack>
    ),
  },
  {
    id: 'likes',
    numeric: true,
    label: 'Likes',
    width: 88,
    valueGetter: (row) => row.reactions?.likes ?? 0,
  },
  {
    id: 'views',
    numeric: true,
    label: 'Views',
    width: 96,
  },
  {
    id: 'userId',
    label: 'User',
    width: 188,
    hideBelow: 'md',
    render: (userId) => <UserBadge userId={userId} />,
  },
];

function PostsExpandRow({ row }) {
  return (
    <>
      <Typography variant="h6" gutterBottom component="div">
        Body
      </Typography>
      <Typography gutterBottom>{row.body}</Typography>
      <Typography variant="subtitle2" color="text.secondary">
        Reactions: {row.reactions?.likes ?? 0} likes ·{' '}
        {row.reactions?.dislikes ?? 0} dislikes
      </Typography>
      <PostComments postId={row.id} />
    </>
  );
}

function PostsTable() {
  const {
    data,
    totalCount,
    loading,
    page,
    rowsPerPage,
    query,
    setQuery,
    handleChangePage,
    handleChangeRowsPerPage,
  } = useServerDataTable({ fetchFn: fetchPosts });

  const userId = query.userId ?? null;
  const tag = query.tag ?? null;
  const searchQuery = query.q ?? '';
  const [searchInput, setSearchInput] = useState('');

  const [editedPosts, setEditedPosts] = useState(new Map());
  const [deletionsByQuery, setDeletionsByQuery] = useState({});
  const [createdPosts, setCreatedPosts] = useState([]);
  const [users, setUsers] = useState(null);
  const [usersError, setUsersError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const [editingPost, setEditingPost] = useState(null);
  const [isCreatingOpen, setIsCreatingOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [deletingPost, setDeletingPost] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  const queryKey = `${userId}|${tag}|${searchQuery}`;
  const currentDeletedIds = deletionsByQuery[queryKey] ?? EMPTY_DELETED;

  useEffect(() => {
    let cancelled = false;
    fetchUsers()
      .then((result) => {
        if (!cancelled) {
          setUsers(result);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setUsersError(err.message ?? 'Failed to load authors');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleRetryUsers = () => {
    setUsersError(null);
    setUsers(null);
    fetchUsers()
      .then((result) => {
        setUsers(result);
      })
      .catch((err) => {
        setUsersError(err.message ?? 'Failed to load authors');
      });
  };

  const displayData = useMemo(
    () => [
      ...createdPosts.filter((row) => !currentDeletedIds.has(row.id)),
      ...data
        .filter((row) => !currentDeletedIds.has(row.id))
        .map((row) => {
          const edit = editedPosts.get(row.id);
          return edit ? { ...row, ...edit } : row;
        }),
    ],
    [data, currentDeletedIds, editedPosts, createdPosts],
  );
  const displayTotal =
    totalCount + createdPosts.length - currentDeletedIds.size;

  const handleFormSave = async ({ title, body, userId }) => {
    setSaving(true);
    setFormError(null);
    try {
      if (!editingPost) {
        const resp = await createPost({ title, body, userId });
        setCreatedPosts((prev) => [
          {
            ...resp,
            body,
            tags: resp.tags ?? [],
            reactions: resp.reactions ?? { likes: 0, dislikes: 0 },
            views: resp.views ?? 0,
          },
          ...prev,
        ]);
setIsCreatingOpen(false);
        enqueueSnackbar('Post created', { variant: 'success' });
      } else {
        await updatePost(editingPost.id, { title, body });
        setEditedPosts(
          (prev) => new Map(prev).set(editingPost.id, { title, body }),
        );
setEditingPost(null);
        enqueueSnackbar('Post updated', { variant: 'success' });
      }
    } catch (err) {
      setFormError(err.message ?? 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const closeForm = () => {
    setEditingPost(null);
    setIsCreatingOpen(false);
    setFormError(null);
  };

  const openCreate = () => {
    setFormError(null);
    setIsCreatingOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingPost) {
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    try {
      await deletePost(deletingPost.id);
      const nextDeleted = new Set(currentDeletedIds).add(deletingPost.id);
      setDeletionsByQuery((prev) => ({ ...prev, [queryKey]: nextDeleted }));
      const remainingOnPage = data.filter(
        (row) => !nextDeleted.has(row.id),
      ).length;
      if (remainingOnPage === 0 && page > 0) {
        handleChangePage(null, page - 1);
      }
      setDeletingPost(null);
      enqueueSnackbar('Post deleted', { variant: 'success' });
    } catch (err) {
      setDeleteError(err.message ?? 'Failed to delete post');
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const trimmed = searchInput.trim();
    if (!trimmed) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (trimmed !== searchQuery) {
        setQuery({ q: trimmed });
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput, searchQuery, setQuery]);

  const handleSearchChange = (value) => {
    setSearchInput(value);
    if (!value.trim() && searchQuery) {
      setQuery({});
    }
  };

  const applyFilter = (kind, value) => {
    setSearchInput('');
    setQuery(value ? { [kind]: value } : {});
  };

  const clearFilter = () => {
    setSearchInput('');
    setQuery({});
  };

  const interactiveColumns = columns.map((column) => {
    if (column.id === 'userId') {
      return {
        ...column,
        render: (id) => (
          <UserBadge userId={id} onClick={() => applyFilter('userId', id)} />
        ),
      };
    }
    if (column.id === 'tags') {
      return {
        ...column,
        render: (tags) => (
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {tags.map((t) => (
              <Chip
                key={t}
                label={t}
                size="small"
                variant="outlined"
                clickable
                color={t === tag ? 'primary' : undefined}
                onClick={(event) => {
                  event.stopPropagation();
                  applyFilter('tag', t);
                }}
              />
            ))}
          </Stack>
        ),
      };
    }
    return column;
  });

  const actionsColumn = {
    id: 'actions',
    label: 'Actions',
    width: 112,
    sortable: false,
    exportable: false,
    render: (_, row) => {
      const busy =
        (saving && editingPost?.id === row.id) ||
        (deleting && deletingPost?.id === row.id);
      return (
        <Stack direction="row" sx={{ gap: 0.5 }}>
          <IconButton
            aria-label="edit post"
            size="small"
            color="primary"
            disabled={busy}
            onClick={(event) => {
              event.stopPropagation();
              setEditingPost(row);
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            aria-label="delete post"
            size="small"
            color="error"
            disabled={busy}
            onClick={(event) => {
              event.stopPropagation();
              setDeletingPost(row);
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Stack>
      );
    },
  };
  interactiveColumns.push(actionsColumn);

  const filterLabel = searchQuery
    ? `"${searchQuery}"`
    : userId
      ? `User ${userId}`
      : tag
        ? `#${tag}`
        : null;

  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          aria-label="create post"
          onClick={openCreate}
        >
          Create Post
        </Button>
      </Box>
      <DataTable
        title="Posts"
        data={displayData}
        loading={loading}
        columns={interactiveColumns}
        getRowId={(row) => row.id}
        enableExpand
        enableSearch
        searchValue={searchInput}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search posts…"
        renderExpandRow={(row) => <PostsExpandRow row={row} />}
        expandWidth="min(720px, 100%)"
        totalCount={displayTotal}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        titleExtras={
          filterLabel && (
            <Chip
              label={`Filter: ${filterLabel}`}
              size="small"
              color="primary"
              onDelete={clearFilter}
            />
          )
        }
      />
      {(editingPost || isCreatingOpen) && (
        <PostFormDialog
          post={editingPost}
          users={users}
          onClose={closeForm}
          onSave={handleFormSave}
          saving={saving}
          error={formError}
          usersError={usersError}
          onRetryUsers={handleRetryUsers}
        />
      )}
      <ConfirmDeleteDialog
        open={Boolean(deletingPost)}
        title={deletingPost?.title}
        onClose={() => {
          setDeletingPost(null);
          setDeleteError(null);
        }}
        onConfirm={handleConfirmDelete}
        deleting={deleting}
        error={deleteError}
      />
    </>
  );
}

export default PostsTable;
