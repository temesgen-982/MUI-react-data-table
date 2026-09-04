import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import DataTable, { useServerDataTable } from '../DataTable/index.js';
import UserBadge from './UserBadge.jsx';

const fetchPosts = ({ page, limit, userId, tag }) => {
  const params = new URLSearchParams({ limit, skip: page * limit });
  let url;
  if (userId) {
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
    flex: 3,
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
    width: 64,
    valueGetter: (row) => row.reactions?.likes ?? 0,
  },
  {
    id: 'views',
    numeric: true,
    label: 'Views',
    width: 64,
  },
  {
    id: 'userId',
    label: 'User',
    width: 160,
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

  const applyFilter = (kind, value) => {
    setQuery(value ? { [kind]: value } : {});
  };

  const clearFilter = () => {
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

  const filterLabel = userId ? `User ${userId}` : tag ? `#${tag}` : null;

  return (
    <DataTable
      title={filterLabel ? `Posts · ${filterLabel}` : 'Posts'}
      data={data}
      loading={loading}
      columns={interactiveColumns}
      getRowId={(row) => row.id}
      enableExpand
      renderExpandRow={(row) => <PostsExpandRow row={row} />}
      expandWidth="min(720px, 100%)"
      totalCount={totalCount}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      toolbarExtras={
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
  );
}

export default PostsTable;
