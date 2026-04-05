import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Tooltip from '@mui/material/Tooltip';

function VerifiedUserBadge({ user, verticalAlign = "text-center", sx={} }) {
  return (
    <>
      {user.verified && (
        <Tooltip title="Verified user" arrow>
          <CheckCircleIcon
            fontSize="inherit"
            color="primary"
            sx={{ ml: 0.5, verticalAlign: verticalAlign, height: "100%", ...sx }}
          />
        </Tooltip>
      )}
    </>
  );
};

export default VerifiedUserBadge;