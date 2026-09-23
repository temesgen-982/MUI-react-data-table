import { useEffect, useReducer, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { fetchComments } from './postApi.js';

function reducer(state, action) {
  switch (action.type) {
    case 'loading':
      return { status: 'loading', comments: null, error: null };
    case 'success':
      return { status: 'success', comments: action.comments, error: null };
    case 'error':
      return { status: 'error', comments: null, error: action.error };
    default:
      return state;
  }
}

function PostComments({ postId }) {
  const [state, dispatch] = useReducer(reducer, {
    status: 'loading',
    comments: null,
    error: null,
  });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchComments(postId)
      .then((result) => {
        if (!cancelled) {
          dispatch({ type: 'success', comments: result });
        }
      })
      .catch((err) => {
        if (!cancelled) {
          dispatch({
            type: 'error',
            error: err.message ?? 'Failed to load comments',
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [postId, attempt]);

  const handleRetry = () => {
    dispatch({ type: 'loading' });
    setAttempt((n) => n + 1);
  };

  if (state.status === 'error') {
    return (
      <Box sx={{ my: 2 }}>
        <Typography variant="subtitle2">Comments</Typography>
        <Typography color="error" variant="body2" sx={{ mb: 1 }}>
          {state.error}
        </Typography>
        <Button size="small" onClick={handleRetry}>
          Retry
        </Button>
      </Box>
    );
  }

  if (state.status === 'loading') {
    return (
      <Box sx={{ my: 2 }}>
        <Skeleton variant="text" width={120} />
        <Skeleton variant="text" width="100%" />
        <Skeleton variant="text" width="80%" />
      </Box>
    );
  }

  return (
    <Box sx={{ my: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Comments ({state.comments.length})
      </Typography>
      <Stack spacing={1.5} divider={<Divider />}>
        {state.comments.map((comment) => (
          <Box key={comment.id}>
            <Typography variant="subtitle2" component="div">
              {comment.user?.fullName ?? comment.user?.username ?? 'Anonymous'}
            </Typography>
            <Typography variant="body2">{comment.body}</Typography>
            <Typography variant="caption" color="text.secondary">
              {comment.likes ?? 0} likes
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

export default PostComments;