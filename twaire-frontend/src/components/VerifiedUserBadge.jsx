import CheckCircleIcon from '@mui/icons-material/CheckCircle';

function VerifiedUserBadge({ user, verticalAlign="text-center" }) {
  return (
    <>
      {user?.verified && (
        <CheckCircleIcon
          fontSize="inherit"
          color="primary"
          sx={{ ml: 0.5, verticalAlign: verticalAlign, height: "100%" }}
          title="Verified"
        />
      )}
    </>
  );
};

export default VerifiedUserBadge;