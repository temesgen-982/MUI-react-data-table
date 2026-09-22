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
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import InputBase from '@mui/material/InputBase';
import Box from '@mui/material/Box';
import { alpha } from '@mui/material/styles';
import { useRef, useState } from 'react';

// Shared style for toolbar icon buttons
const toolbarIconButtonSx = {
  borderRadius: 1,
  bgcolor: 'action.hover',
};

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
    enableSearch,
    searchValue = '',
    onSearchChange,
    searchPlaceholder = 'Search…',
    toolbarExtras,
    titleExtras,
  } = props;
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchOpen, setSearchOpen] = useState(Boolean(searchValue));
  const inputRef = useRef(null);
  const menuOpen = Boolean(anchorEl);
  const showSearchField = searchOpen || Boolean(searchValue);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSearchClose = () => {
    onSearchChange?.('');
    setSearchOpen(false);
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
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mr: 'auto',
            minWidth: 0,
            flexWrap: 'wrap',
          }}
        >
          <Typography
            variant="h6"
            id={titleId}
            component="div"
            sx={{ minWidth: 0 }}
          >
            {title}
          </Typography>
          {titleExtras}
        </Box>
      )}
      {numSelected > 0 && onDelete && (
        <Tooltip title="Delete">
          <IconButton onClick={() => onDelete()} aria-label="delete" sx={toolbarIconButtonSx}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      )}
      {enableSearch && numSelected === 0 && (
        <Tooltip title={showSearchField ? '' : 'Search'}>
          <InputBase
          ref={inputRef}
          value={searchValue}
          onChange={(event) => onSearchChange?.(event.target.value)}
          onFocus={() => setSearchOpen(true)}
          onClick={() => {
            if (!showSearchField) {
              setSearchOpen(true);
              inputRef.current?.focus();
            }
          }}
          onBlur={() => {
            if (!searchValue) {
              setSearchOpen(false);
            }
          }}
          placeholder={showSearchField ? searchPlaceholder : undefined}
          inputProps={{ 'aria-label': searchPlaceholder }}
          sx={{
            overflow: 'hidden',
            width: showSearchField ? { xs: '60vw', sm: 280 } : 44,
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            bgcolor: 'action.hover',
            cursor: showSearchField ? 'text' : 'pointer',
            transition: (theme) =>
              theme.transitions.create('width', {
                duration: theme.transitions.duration.standard,
              }),
          }}
          startAdornment={<SearchIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />}
          endAdornment={
            searchValue ? (
              <IconButton
                size="small"
                aria-label="clear search"
                onMouseDown={(event) => event.preventDefault()}
                onClick={handleSearchClose}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            ) : null
          }
        />
        </Tooltip>
      )}
      {enableColumnVisibility && (
        <Tooltip title="Columns">
          <IconButton
            onClick={handleOpenMenu}
            aria-label="columns visibility"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            sx={toolbarIconButtonSx}
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
            sx={toolbarIconButtonSx}
          >
            {dense ? <DensitySmallIcon /> : <DensityMediumIcon />}
          </IconButton>
        </Tooltip>
      )}
      {enableExport && (
        <Tooltip title="Export CSV">
          <IconButton onClick={onExport} aria-label="export CSV" sx={toolbarIconButtonSx}>
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
