import { useState } from 'react';

export function useTableSort(defaultSortBy, defaultSortOrder = 'asc') {
  const [order, setOrder] = useState(defaultSortOrder);
  const [orderBy, setOrderBy] = useState(defaultSortBy);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return { order, orderBy, handleRequestSort };
}