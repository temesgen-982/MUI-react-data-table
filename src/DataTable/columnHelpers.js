export function descendingComparator(a, b, orderBy, getValue) {
  const aVal = getValue ? getValue(a) : a[orderBy];
  const bVal = getValue ? getValue(b) : b[orderBy];
  if (bVal < aVal) {
    return -1;
  }
  if (bVal > aVal) {
    return 1;
  }
  return 0;
}

export function getComparator(order, orderBy, getValue) {
  return (a, b) =>
    order === 'desc'
      ? descendingComparator(a, b, orderBy, getValue)
      : -descendingComparator(a, b, orderBy, getValue);
}

export function columnWidthStyle(column) {
  const style = {};
  if (column.width !== undefined) {
    style.width = column.width;
  }
  if (column.minWidth !== undefined) {
    style.minWidth = column.minWidth;
  }
  return style;
}