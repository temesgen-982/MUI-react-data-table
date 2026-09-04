import { useState } from 'react';

export function useTableColumnVisibility(defaultHiddenColumnIds = []) {
  const [hiddenColumnIds, setHiddenColumnIds] = useState(
    () => new Set(defaultHiddenColumnIds),
  );

  const handleToggleColumn = (id) => {
    setHiddenColumnIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return { hiddenColumnIds, handleToggleColumn };
}