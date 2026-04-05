import AddIcon from "@mui/icons-material/Add";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import UserAvatar from "./UserAvatar.jsx";

function AccountSwitcherDialog({
  open,
  onClose,
  accounts,
  currentUserId,
  switchingUserId,
  onSwitchAccount,
  onAddAccount,
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Switch accounts</DialogTitle>
      <DialogContent dividers>
        {accounts.length === 0 ? (
          <Typography color="text.secondary">
            No saved accounts on this browser yet. Log into another account to add it here.
          </Typography>
        ) : (
          <List disablePadding>
            {accounts.map((account) => {
              const isCurrent = account.userId === currentUserId;
              const isSwitching = switchingUserId === account.userId;

              return (
                <ListItemButton
                  key={account.userId}
                  onClick={() => onSwitchAccount(account)}
                  disabled={isCurrent || isSwitching}
                  sx={{ borderRadius: 2, mb: 0.75 }}
                >
                  <UserAvatar user={account} size={42} sx={{ mr: 1.5 }} />
                  <ListItemText
                    primary={
                      <Typography sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                        <span>{account.publicName}</span>
                        {account.verified && (
                          <CheckCircleIcon sx={{ fontSize: 16, color: "primary.main" }} />
                        )}
                      </Typography>
                    }
                    secondary={`@${account.username}${isCurrent ? " (Current)" : ""}`}
                  />
                </ListItemButton>
              );
            })}
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: "space-between", px: 3, py: 2 }}>
        <Button onClick={onAddAccount} startIcon={<AddIcon />}>
          Log into another account
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default AccountSwitcherDialog;
