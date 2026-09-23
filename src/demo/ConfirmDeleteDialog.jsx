import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';

function ConfirmDeleteDialog({ open, title, onConfirm, onClose, deleting, error }) {
  return (
    <Dialog
      open={open}
      onClose={deleting ? undefined : onClose}
      maxWidth="xs"
      disableRestoreFocus
    >
      <DialogTitle>Delete post</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete “{title}”? This cannot be undone.
        </Typography>
        {error && (
          <Typography role="alert" color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={deleting} startIcon={<CloseIcon />}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          color="error"
          variant="contained"
          disabled={deleting}
          startIcon={<DeleteIcon />}
        >
          {deleting ? 'Deleting…' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmDeleteDialog;