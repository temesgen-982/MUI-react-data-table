import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Collapse from '@mui/material/Collapse';
import { useState } from 'react';

function resolveCellContent(column, value, row) {
  if (column.render) {
    return column.render(value, row);
  }
  if (column.format && value !== undefined && value !== null) {
    return column.format(value);
  }
  return value;
}

function DataTableCard({
  row,
  columns,
  getRowId,
  onRowClick,
  isItemSelected,
  enableSelection,
  enableExpand,
  renderExpandRow,
}) {
  const [open, setOpen] = useState(false);
  const id = getRowId(row);
  const selected = enableSelection && isItemSelected(id);
  const labelColumnId =
    columns.find((column) => !column.numeric)?.id ?? columns[0]?.id;
  const labelColumn = columns.find((column) => column.id === labelColumnId);
  const labelValue = labelColumn
    ? resolveCellContent(labelColumn, row[labelColumn.id], row)
    : null;

  const handleToggleExpand = (event) => {
    event.stopPropagation();
    setOpen((prev) => !prev);
  };

  const handleCheckbox = (event) => {
    event.stopPropagation();
    onRowClick(event, id);
  };

  return (
    <Card
      variant="outlined"
      onClick={(event) => onRowClick(event, id)}
      sx={{
        cursor: 'pointer',
        bgcolor: selected ? 'action.selected' : undefined,
        '&:hover': { bgcolor: 'action.hover' },
      }}
    >
      <CardHeader
        avatar={
          enableSelection && (
            <Checkbox
              color="primary"
              checked={selected}
              onClick={handleCheckbox}
              slotProps={{
                input: {
                  'aria-label': `${labelColumn?.label ?? 'row'} ${id}`,
                },
              }}
            />
          )
        }
        title={labelValue}
        action={
          enableExpand && (
            <IconButton onClick={handleToggleExpand} size="small">
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          )
        }
      />
      <CardContent>
        <Stack spacing={1}>
          {columns
            .filter((column) => column.id !== labelColumnId)
            .map((column) => {
              const value = column.valueGetter
                ? column.valueGetter(row)
                : row[column.id];
              return (
                <Stack
                  key={column.id}
                  direction="row"
                  spacing={1}
                  sx={{ justifyContent: 'space-between' }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {column.label}
                  </Typography>
                  <Typography variant="body2" component="div" sx={{ textAlign: 'right' }}>
                    {resolveCellContent(column, value, row)}
                  </Typography>
                </Stack>
              );
            })}
        </Stack>
      </CardContent>
      {enableExpand && renderExpandRow && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <CardContent sx={{ pt: 0 }}>{renderExpandRow(row)}</CardContent>
        </Collapse>
      )}
    </Card>
  );
}

function DataTableCards({
  columns,
  data,
  getRowId,
  onRowClick,
  isItemSelected,
  enableSelection,
  enableExpand,
  renderExpandRow,
  loading,
}) {
  return (
    <Stack spacing={1} sx={{ p: 2 }}>
      {loading && <LinearProgress />}
      {data.map((row) => (
        <DataTableCard
          key={getRowId(row)}
          row={row}
          columns={columns}
          getRowId={getRowId}
          onRowClick={onRowClick}
          isItemSelected={isItemSelected}
          enableSelection={enableSelection}
          enableExpand={enableExpand}
          renderExpandRow={renderExpandRow}
        />
      ))}
    </Stack>
  );
}

export default DataTableCards;
