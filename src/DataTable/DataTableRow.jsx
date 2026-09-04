import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useState, useId, Fragment } from 'react';
import { columnWidthStyle } from './columnHelpers.js';

function DataTableRow({
  row,
  labelId,
  isItemSelected,
  onRowClick,
  columns,
  rowLabelColumnId,
  enableSelection,
  enableExpand,
  renderExpandRow,
  getRowId,
  expandWidth = '100%',
}) {
  const [open, setOpen] = useState(false);
  const detailsId = useId();

  const rowId = getRowId(row);

  const handleToggle = (event) => {
    event.stopPropagation();
    setOpen((prev) => !prev);
  };

  const handleCheckbox = (event) => {
    event.stopPropagation();
    onRowClick(event, rowId);
  };

  const prefixCells = (enableExpand ? 1 : 0) + (enableSelection ? 1 : 0);

  return (
    <Fragment>
      <TableRow
        hover
        onClick={(event) => onRowClick(event, rowId)}
        role={enableSelection ? 'checkbox' : undefined}
        aria-checked={enableSelection ? isItemSelected : undefined}
        tabIndex={-1}
        selected={enableSelection && isItemSelected}
        sx={{ cursor: 'pointer' }}
      >
        {enableExpand && (
          <TableCell sx={{ width: 48 }}>
            <IconButton
              aria-label={open ? 'collapse row' : 'expand row'}
              aria-expanded={open}
              aria-controls={detailsId}
              size="small"
              onClick={handleToggle}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
        )}
        {enableSelection && (
          <TableCell padding="checkbox">
            <Checkbox
              color="primary"
              checked={isItemSelected}
              onClick={handleCheckbox}
              slotProps={{
                input: { 'aria-labelledby': labelId },
              }}
            />
          </TableCell>
        )}
        {columns.map((column) => {
          const isLabel = column.id === rowLabelColumnId;
          const value = column.valueGetter ? column.valueGetter(row) : row[column.id];
          let content = value;
          if (column.render) {
            content = column.render(value, row);
          } else if (column.format && typeof value === 'number') {
            content = column.format(value);
          }
          return (
            <TableCell
              key={column.id}
              component={isLabel ? 'th' : 'td'}
              scope={isLabel ? 'row' : undefined}
              id={isLabel ? labelId : undefined}
              align={column.numeric ? 'right' : 'left'}
              style={columnWidthStyle(column)}
            >
              {content}
            </TableCell>
          );
        })}
      </TableRow>
      {enableExpand && renderExpandRow && (
        <TableRow id={detailsId} aria-hidden={!open ? true : undefined}>
          <TableCell
            style={{ paddingBottom: 0, paddingTop: 0, paddingLeft: 0 }}
            colSpan={columns.length + prefixCells}
          >
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1, maxWidth: expandWidth }}>
                {renderExpandRow(row)}
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  );
}

export default DataTableRow;