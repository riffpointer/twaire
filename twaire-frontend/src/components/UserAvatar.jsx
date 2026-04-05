import { Avatar } from "@mui/material";
import ApiConfig from "../utils/ApiConfig.js";

function UserAvatar({ user, size = 38, sx = {}, ...props }) {
  const initial = (user?.publicName || user?.username || "?")[0]?.toUpperCase() || "?";
  
  return (
    <Avatar
      src={
        user?.profilePicture
          ? `${ApiConfig.serverUrl}/${user.profilePicture}`
          : undefined
      }
      title={user?.publicName || user?.username}
      sx={{ width: size, height: size, ...sx }}
      {...props}
    >
      {initial}
    </Avatar>
  );
}

export default UserAvatar;
