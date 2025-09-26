import {
  Paper,
  Box,
  Avatar,
  Typography,
} from "@mui/material";
import PersonIcon from '@mui/icons-material/Person';
import ApiConfig from "../utils/ApiConfig.jsx";
import VerifiedUserBadge from "./VerifiedUserBadge.jsx";

function UserHeader({ user, children }) {
  return (
    <Paper elevation={2} sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <Avatar
          src={user.profilePicture ? `${ApiConfig.serverUrl}/${user.profilePicture}` : `${ApiConfig.serverUrl}/api/helper/placeholder/128x128?text=${user.publicName.charAt(0)}`}
          sx={{ width: 100, height: 100, mr: 3, fontSize: '4rem' }}
        >
          {!user.profilePicture && <PersonIcon fontSize="inherit" />}
        </Avatar>
        <Box>
          <Typography variant="h4" component="h1" sx={{ mb: 0, display: "flex", alignItems: "center" }}>
            {user.publicName || user.username}
            <VerifiedUserBadge user={user} />
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
