import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

function PromptLoginDialog({ open, onClose, action="perform this action" }) {
  const navigate = useNavigate();

  const handleLogin = () => {
    onClose();
    navigate("/login");
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Login Required</DialogTitle>
      <DialogContent>
        <Typography>You must be logged in to {action}. Please login in or create a new account!</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button onClick={handleLogin} color="primary">Login</Button>
      </DialogActions>
    </Dialog>
  );
}

export default PromptLoginDialog;
