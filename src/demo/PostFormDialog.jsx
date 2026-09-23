import { useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

function PostFormDialog({ post, users, onSave, onClose, saving, error }) {
  const isCreate = !post;
  const [title, setTitle] = useState(post?.title ?? '');
  const [body, setBody] = useState(post?.body ?? '');
  const [author, setAuthor] = useState(null);
  const resolvedUserId = isCreate ? author?.id ?? users?.[0]?.id : undefined;

  const canSave =
    title.trim().length > 0 &&
    body.trim().length > 0 &&
    (!isCreate || Boolean(resolvedUserId)) &&
    !saving;

  const handleSave = () => {
    onSave({
      title: title.trim(),
      body: body.trim(),
      ...(isCreate ? { userId: resolvedUserId } : {}),
    });
  };

  const submitLabel = isCreate ? 'Create Post' : 'Save Post';
  const submitBusyLabel = isCreate ? 'Creating…' : 'Saving…';
  const SubmitIcon = isCreate ? AddIcon : CheckIcon;

  return (
    <Dialog
      open
      onClose={saving ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      disableRestoreFocus
    >
      <DialogTitle>{isCreate ? 'Create post' : 'Edit post'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          id="post-title"
          label="Title"
          fullWidth
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <TextField
          margin="dense"
          id="post-body"
          label="Body"
          fullWidth
          multiline
          minRows={6}
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
        {isCreate && (
          <Autocomplete
            id="post-user"
            options={users ?? []}
            getOptionLabel={(user) => `${user.firstName} ${user.lastName}`}
            isOptionEqualToValue={(option, value) => option.id === value?.id}
            value={author ?? users?.[0] ?? null}
            onChange={(_, newValue) => setAuthor(newValue)}
            disableClearable
            disabled={!users}
            renderInput={(params) => (
              <TextField
                {...params}
                margin="dense"
                label="Author"
                helperText={!users ? 'Loading authors…' : undefined}
              />
            )}
          />
        )}
        {error && (
          <Typography role="alert" color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={onClose}
          disabled={saving}
          startIcon={<CloseIcon />}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!canSave}
          variant="contained"
          startIcon={<SubmitIcon />}
        >
          {saving ? submitBusyLabel : submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PostFormDialog;