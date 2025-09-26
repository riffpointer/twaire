import { Snackbar, Box } from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";

function AppSnackbar({ open, onClose, message, severity }) {
  const getSnackbarIcon = (severity) => {
    switch (severity) {
      case "error":
        return <ErrorIcon sx={{ mr: 1 }} />; // mr = margin-right
      case "success":
        return <CheckCircleIcon sx={{ mr: 1 }} />;
      case "warning":
        return <WarningIcon sx={{ mr: 1 }} />;
      case "info":
        return <InfoIcon sx={{ mr: 1 }} />;
      default:
        return null;
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      ContentProps={{
        sx: {
          backgroundColor:
            severity === "error"
              ? "#d32f2f"
              : severity === "success"
              ? "#2e7d32"
              : severity === "warning"
              ? "#ed6c02"
              : "#0288d1",
          display: "flex",
          alignItems: "center",
        },
      }}
      message={
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {getSnackbarIcon(severity)}
          {message}
        </Box>
      }
    />
  );
}

export default AppSnackbar;
