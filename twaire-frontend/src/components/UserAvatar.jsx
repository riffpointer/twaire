import ApiConfig from "../utils/ApiConfig.js";

function UserAvatar({ user, size = 38, sx = {}, className = "", ...props }) {
  const initial = (user?.publicName || user?.username || "?")[0]?.toUpperCase() || "?";
  
  const style = {
    width: size,
    height: size,
    fontSize: size * 0.5,
    backgroundColor: user?.profilePicture ? 'transparent' : '#6750A4',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    overflow: 'hidden',
    objectFit: 'cover',
    ...sx
  };

  if (user?.profilePicture) {
    return (
      <img
        src={`${ApiConfig.serverUrl}/${user.profilePicture}`}
        alt={user?.publicName || user?.username}
        title={user?.publicName || user?.username}
        style={style}
        className={`user-avatar ${className}`}
        {...props}
      />
    );
  }

  return (
    <div
      title={user?.publicName || user?.username}
      style={style}
      className={`user-avatar ${className}`}
      {...props}
    >
      {initial}
    </div>
  );
}

export default UserAvatar;
