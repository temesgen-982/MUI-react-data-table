import { useState } from 'react';

export function useTableSelect(data, getRowId, enabled = true) {
  const [selected, setSelected] = useState([]);

  const handleSelectAllClick = () => {
    if (!enabled) {
      return;
    }
    if (selected.length > 0) {
      setSelected([]);
      return;
    }
    setSelected(data.map((row) => getRowId(row)));
  };

  const handleClick = (event, id) => {
    if (!enabled) {
      return;
    }
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id],
    );
  };

  const clearSelection = () => {
    setSelected([]);
  };

  return { selected, handleSelectAllClick, handleClick, clearSelection };
}