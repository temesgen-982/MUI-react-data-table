import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import DensitySmallIcon from '@mui/icons-material/DensitySmall';
import DensityMediumIcon from '@mui/icons-material/DensityMedium';
import { alpha } from '@mui/material/styles';
import { useState } from 'react';

function DataTableToolbar(props) {
  const {
    title,
    titleId,
    numSelected,
    columns,
    hiddenColumnIds,
    onToggleColumn,
    dense,
    onToggleDense,
    onExport,
    onDelete,
    enableColumnVisibility,
    enableDense,
    enableExport,
    toolbarExtras,
  } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <Toolbar
      sx={[
        {
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          gap: 1,
          flexWrap: 'wrap',
        },
        numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
        },
      ]}
    >
      {numSelected > 0 ? (
        <Typography
          variant="subtitle1"
          component="div"
          sx={{
            color: 'inherit',
            mr: 'auto',
          }}
        >
          {numSelected} selected
        </Typography>
      ) : (
        <Typography
          sx={{ mr: 'auto' }}
          variant="h6"
          id={titleId}
          component="div"
        >
          {title}
        </Typography>
      )}
      {numSelected > 0 && onDelete && (
        <Tooltip title="Delete">
          <IconButton onClick={() => onDelete()} aria-label="delete">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      )}
      {enableColumnVisibility && (
        <Tooltip title="Columns">
          <IconButton
            onClick={handleOpenMenu}
            aria-label="columns visibility"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}
      {enableDense && (
        <Tooltip title={dense ? 'Dense padding (on)' : 'Dense padding (off)'}>
          <IconButton
            onClick={onToggleDense}
            aria-label="toggle dense padding"
            color={dense ? 'primary' : undefined}
          >
            {dense ? <DensitySmallIcon /> : <DensityMediumIcon />}
          </IconButton>
        </Tooltip>
      )}
      {enableExport && (
        <Tooltip title="Export CSV">
          <IconButton onClick={onExport} aria-label="export CSV">
            <DownloadIcon />
          </IconButton>
        </Tooltip>
      )}
      {toolbarExtras}
      {enableColumnVisibility && (
        <Menu
          anchorEl={anchorEl}
          open={menuOpen}
          onClose={handleCloseMenu}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          {columns.map((column) => {
            const checked = !hiddenColumnIds.has(column.id);
            return (
              <MenuItem
                key={column.id}
                onClick={() => onToggleColumn(column.id)}
              >
                <Checkbox
                  size="small"
                  checked={checked}
                  tabIndex={-1}
                  disableRipple
                />
                <ListItemText>{column.label}</ListItemText>
              </MenuItem>
            );
          })}
        </Menu>
      )}
    </Toolbar>
  );
}

export default DataTableToolbar;