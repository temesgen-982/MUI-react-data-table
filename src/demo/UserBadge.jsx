import { useEffect, useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';

const cache = new Map();

function fetchUser(id) {
  if (cache.has(id)) {
    return Promise.resolve(cache.get(id));
  }
  return fetch(
    `https://dummyjson.com/users/${id}?select=firstName,lastName,image`,
  )
    .then((res) => res.json())
    .then((user) => {
      cache.set(id, user);
      return user;
    });
}

function UserBadge({ userId, onClick }) {
  const [user, setUser] = useState(null);
  const [loadedId, setLoadedId] = useState(null);
  const loading = loadedId !== userId;

  useEffect(() => {
    let cancelled = false;
    fetchUser(userId).then((data) => {
      if (!cancelled) {
        setUser(data);
        setLoadedId(userId);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton width={60} />
      </Box>
    );
  }

  return (
    <Box
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(userId);
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        whiteSpace: 'nowrap',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? { opacity: 0.7 } : undefined,
      }}
    >
      <Avatar src={user?.image} sx={{ width: 24, height: 24 }}>
        {user?.firstName?.[0]}
      </Avatar>
      <Typography variant="body2">
        {user ? `${user.firstName} ${user.lastName}` : `User ${userId}`}
      </Typography>
    </Box>
  );
}

export default UserBadge;
