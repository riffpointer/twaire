import {
  Box,
  Paper,
  Typography
} from "@mui/material";
import UserAvatar from "./UserAvatar.jsx";
import VerifiedUserBadge from "./VerifiedUserBadge.jsx";

function UserHeader({ user, children }) {
  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <UserAvatar user={user} size={112} sx={{ mr: 2 }} />
        <Box>
          <Typography variant="h4" component="h1" sx={{ mb: 0, display: "flex", alignItems: "center" }}>
            {user.publicName || user.username}
            <VerifiedUserBadge user={user} sx={{ fontSize: 24 }} />
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 0.5 }}>
            @{user.username}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {user.subscribers || 0} subscriber{user.subscribers == 1 || "s"} &bull;&nbsp;
            {user.accountViews || user.views || 0} channel views
          </Typography>
          {children}
        </Box>
      </Box>

      {user.bio && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="subtitle1" component="strong">
            About this channel
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {user.bio}
          </Typography>
        </Paper>
      )}
    </Paper>
  );
}

export default UserHeader;
