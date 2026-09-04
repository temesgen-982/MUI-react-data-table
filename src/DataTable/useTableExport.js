export function useTableExport() {
  const handleExport = (visibleColumns, rows, fileName = 'data.csv') => {
    const escapeCell = (value) => {
      const text = String(value ?? '');
      return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
    };

    const header = visibleColumns.map((column) => escapeCell(column.label));
    const body = rows.map((row) =>
      visibleColumns.map((column) => {
        const raw = column.valueGetter ? column.valueGetter(row) : row[column.id];
        let value = column.format ? column.format(raw) : raw;
        if (Array.isArray(value)) {
          value = value.join(', ');
        }
        return escapeCell(value);
      }),
    );

    const csv = [header, ...body].map((line) => line.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  return { handleExport };
}