import { forwardRef } from 'react';
import { SnackbarProvider } from 'notistack';
import Alert from '@mui/material/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const variantIcons = {
  default: <CheckCircleIcon />,
  success: <CheckCircleIcon />,
  info: <InfoOutlinedIcon />,
  warning: <WarningAmberIcon />,
  error: <ErrorOutlineOutlinedIcon />,
};

const ToastContent = forwardRef(function ToastContent(props, ref) {
  const { variant, message, hideIconVariant } = props;
  return (
    <Alert
      ref={ref}
      variant="filled"
      severity={variant === 'default' ? 'info' : variant}
      icon={hideIconVariant ? null : variantIcons[variant]}
      sx={{ fontWeight: 500 }}
    >
      {message}
    </Alert>
  );
});

export default function ToastProvider({ children }) {
  return (
    <SnackbarProvider
      maxSnack={3}
      autoHideDuration={3000}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      Components={{
        default: ToastContent,
        success: ToastContent,
        error: ToastContent,
        warning: ToastContent,
        info: ToastContent,
      }}
    >
      {children}
    </SnackbarProvider>
  );
}