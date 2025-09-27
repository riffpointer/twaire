import { Avatar } from "@mui/material";
import ApiConfig from "../utils/ApiConfig.js";

function UserAvatar({ user, size = 38, sx = {}, ...props }) {
	return (
		<Avatar
			src={user.profilePicture ? `${ApiConfig.serverUrl}/${user.profilePicture}` : undefined}
			title={user.publicName}
			sx={{ width: size, height: size, ...sx }}
			{...props}
		>
			{user.publicName[0]}
		</Avatar>
	);
}

export default UserAvatar;