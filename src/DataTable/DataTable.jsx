import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import LinearProgress from '@mui/material/LinearProgress';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useMemo, useId } from 'react';

import { getComparator } from './columnHelpers.js';
import { useViewportWidth } from './useViewportWidth.js';
import { useTableSort } from './useTableSort.js';
import { useTableSelect } from './useTableSelect.js';
import { useTablePagination } from './useTablePagination.js';
import { useTableColumnVisibility } from './useTableColumnVisibility.js';
import { useTableExport } from './useTableExport.js';
import { useDenseToggle } from './useDenseToggle.js';

import DataTableHead from './DataTableHead.jsx';
import DataTableToolbar from './DataTableToolbar.jsx';
import DataTableRow from './DataTableRow.jsx';
import DataTableCards from './DataTableCards.jsx';
import DataTablePagination from './DataTablePagination.jsx';

function DataTable(props) {
  const {
    columns = [],
    data = [],
    getRowId,
    title = 'Data',
    defaultSortBy,
    defaultSortOrder = 'asc',
    rowsPerPageOptions = [5, 10, 20, 30],
    defaultRowsPerPage = 5,
    maxHeight = 800,
    enableSelection = true,
    enableExpand = false,
    renderExpandRow,
    expandWidth = '100%',
    enableColumnVisibility = true,
    defaultHiddenColumnIds = [],
    enableDense = true,
    enableExport = true,
    enableCardView = true,
    cardViewBreakpoint = 'md',
    loading = false,
    toolbarExtras,
    titleExtras,
    enableSearch = false,
    searchValue,
    onSearchChange,
    searchPlaceholder,
    onDelete,
    totalCount,
    page: pageProp,
    rowsPerPage: rowsPerPageProp,
    onPageChange,
    onRowsPerPageChange,
  } = props;

  const selectionLabel = `select all ${title.toLowerCase()}s`;
  const tableTitleId = useId();

  const { order, orderBy, handleRequestSort } = useTableSort(
    defaultSortBy,
    defaultSortOrder,
  );
  const { selected, handleSelectAllClick, handleClick, clearSelection } =
    useTableSelect(data, getRowId, enableSelection);
  const isServerSide =
    onPageChange !== undefined ||
    onRowsPerPageChange !== undefined ||
    totalCount !== undefined;

  const internalPagination = useTablePagination(defaultRowsPerPage);

  const page = isServerSide ? pageProp : internalPagination.page;
  const rowsPerPage = isServerSide
    ? rowsPerPageProp
    : internalPagination.rowsPerPage;
  const handleChangePage = isServerSide
    ? onPageChange
    : internalPagination.handleChangePage;
  const handleChangeRowsPerPage = isServerSide
    ? onRowsPerPageChange
    : internalPagination.handleChangeRowsPerPage;
  const { hiddenColumnIds, handleToggleColumn } =
    useTableColumnVisibility(defaultHiddenColumnIds);
  const { handleExport } = useTableExport();
  const { dense, toggleDense } = useDenseToggle();
  const theme = useTheme();
  const isBelowCardBreakpoint = useMediaQuery(
    theme.breakpoints.down(cardViewBreakpoint),
  );
  const isCardView = enableCardView && isBelowCardBreakpoint;
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const viewportWidth = useViewportWidth();
  const breakpointValues = theme.breakpoints.values;

  const visibleColumns = useMemo(
    () =>
      columns.filter((column) => {
        if (hiddenColumnIds.has(column.id)) {
          return false;
        }
        if (column.hideBelow !== undefined) {
          const threshold =
            typeof column.hideBelow === 'number'
              ? column.hideBelow
              : breakpointValues[column.hideBelow] ?? 0;
          return viewportWidth >= threshold;
        }
        return true;
      }),
    [columns, hiddenColumnIds, viewportWidth, breakpointValues],
  );

  const sizedColumns = useMemo(() => {
    const flexColumns = visibleColumns.filter(
      (column) => column.width === undefined,
    );
    const flexTotal = flexColumns.reduce(
      (sum, column) => sum + (column.flex ?? 1),
      0,
    );
    if (flexTotal === 0) {
      return visibleColumns;
    }
    return visibleColumns.map((column) => {
      if (column.width !== undefined) {
        return column;
      }
      const flex = column.flex ?? 1;
      return {
        ...column,
        width: `${(flex / flexTotal) * 100}%`,
      };
    });
  }, [visibleColumns]);

  const rowLabelColumnId = useMemo(
    () => columns.find((column) => !column.numeric)?.id ?? columns[0]?.id,
    [columns],
  );

  const rowCount = isServerSide ? totalCount : data.length;

  const activeSortColumn = useMemo(
    () => columns.find((column) => column.id === orderBy),
    [columns, orderBy],
  );
  const sortValueGetter = activeSortColumn?.valueGetter;

  const sortComparator = useMemo(
    () => getComparator(order, orderBy, sortValueGetter),
    [order, orderBy, sortValueGetter],
  );

  const visibleRows = useMemo(() => {
    if (isServerSide) {
      return [...data].sort(sortComparator);
    }
    return [...data]
      .sort(sortComparator)
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [data, sortComparator, page, rowsPerPage, isServerSide]);

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows = !isServerSide
    ? page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - rowCount)
      : 0
    : 0;

  const handleExportCsv = () => {
    const fileName = `${title.replace(/\s+/g, '-').toLowerCase()}.csv`;
    handleExport(visibleColumns, visibleRows, fileName);
  };

  const handleDelete = () => {
    if (!onDelete) {
      return;
    }
    onDelete(selected);
    clearSelection();
  };

  const isRowSelected = (id) => selected.includes(id);

  const numSelectedOnPage = useMemo(
    () =>
      visibleRows.filter((row) => selected.includes(getRowId(row))).length,
    [selected, visibleRows, getRowId],
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ width: '100%', mb: 2 }}>
        <DataTableToolbar
          title={title}
          titleId={tableTitleId}
          numSelected={selected.length}
          columns={columns}
          hiddenColumnIds={hiddenColumnIds}
          onToggleColumn={handleToggleColumn}
          dense={dense}
          onToggleDense={toggleDense}
          onExport={handleExportCsv}
          onDelete={enableSelection && selected.length > 0 ? handleDelete : undefined}
          enableColumnVisibility={enableColumnVisibility}
          enableDense={enableDense}
          enableExport={enableExport}
          enableSearch={enableSearch}
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          toolbarExtras={toolbarExtras}
          titleExtras={titleExtras}
        />
        {isCardView ? (
          <DataTableCards
            columns={sizedColumns}
            data={visibleRows}
            getRowId={getRowId}
            onRowClick={handleClick}
            isItemSelected={isRowSelected}
            enableSelection={enableSelection}
            enableExpand={enableExpand}
            renderExpandRow={renderExpandRow}
            loading={loading}
          />
        ) : (
        <TableContainer sx={{ maxHeight }}>
          <Table
            stickyHeader
            sx={{ width: '100%', tableLayout: 'fixed' }}
            aria-labelledby={tableTitleId}
            size={dense ? 'small' : 'medium'}
          >
            <DataTableHead
              numSelected={numSelectedOnPage}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={visibleRows.length}
              columns={sizedColumns}
              enableExpand={enableExpand}
              enableSelection={enableSelection}
              selectionLabel={selectionLabel}
            />
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell
                    colSpan={
                      visibleColumns.length +
                      (enableExpand ? 1 : 0) +
                      (enableSelection ? 1 : 0)
                    }
                    sx={{ p: 0, borderBottom: 0 }}
                  >
                    <LinearProgress />
                  </TableCell>
                </TableRow>
              )}
              {visibleRows.map((row, index) => {
                const id = getRowId(row);
                const isItemSelected = selected.includes(id);
                const labelId = `enhanced-table-checkbox-${tableTitleId}-${index}`;

                return (
                  <DataTableRow
                    key={id}
                    row={row}
                    labelId={labelId}
                    isItemSelected={isItemSelected}
                    onRowClick={handleClick}
                    columns={sizedColumns}
                    rowLabelColumnId={rowLabelColumnId}
                    getRowId={getRowId}
                    enableSelection={enableSelection}
                    enableExpand={enableExpand}
                    renderExpandRow={renderExpandRow}
                    expandWidth={expandWidth}
                  />
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: (dense ? 33 : 53) * emptyRows,
                  }}
                >
                  <TableCell
                    colSpan={
                      visibleColumns.length +
                      (enableExpand ? 1 : 0) +
                      (enableSelection ? 1 : 0)
                    }
                  />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        )}
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={rowCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          ActionsComponent={DataTablePagination}
          labelRowsPerPage={isSmallScreen ? '' : 'Rows per page:'}
          labelDisplayedRows={({ from, to, count }) =>
            isSmallScreen
              ? `${from}–${to}` + (count !== -1 ? ` / ${count}` : '')
              : `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`
          }
        />
      </Paper>
    </Box>
  );
}

export default DataTable;
