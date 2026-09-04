import { useCallback, useEffect, useRef, useState } from 'react';
import { useUrlSearchParam, parseToNumber } from './useUrlSearchParam.js';

export function useServerDataTable({
  fetchFn,
  defaultRowsPerPage = 5,
  defaultPage = 0,
}) {
  const [page, setPage] = useUrlSearchParam('page', defaultPage, parseToNumber);
  const [rowsPerPage, setRowsPerPage] = useUrlSearchParam(
    'limit',
    defaultRowsPerPage,
    parseToNumber,
  );
  const [query, setQueryState] = useState({});
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!fetchFn) {
      return;
    }
    const requestId = ++requestIdRef.current;
    fetchFn({ page, limit: rowsPerPage, ...query })
      .then((result) => {
        if (requestId !== requestIdRef.current) {
          return;
        }
        setData(result.data);
        setTotalCount(result.total);
        setError(null);
        setLoading(false);
      })
      .catch((err) => {
        if (requestId !== requestIdRef.current) {
          return;
        }
        setError(err);
        setLoading(false);
      });
  }, [fetchFn, page, rowsPerPage, query]);

  const setQuery = useCallback(
    (next) => {
      setLoading(true);
      setQueryState(next);
      setPage(defaultPage);
    },
    [setPage, defaultPage],
  );

  const handleChangePage = useCallback(
    (event, newPage) => {
      setLoading(true);
      setPage(newPage);
    },
    [setPage],
  );

  const handleChangeRowsPerPage = useCallback(
    (event) => {
      const next = parseInt(event.target.value, 10);
      setLoading(true);
      setRowsPerPage(next);
      setPage(0);
    },
    [setPage, setRowsPerPage],
  );

  return {
    data,
    totalCount,
    loading,
    error,
    page,
    rowsPerPage,
    query,
    setQuery,
    handleChangePage,
    handleChangeRowsPerPage,
  };
}
