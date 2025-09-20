import React from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

/**
 * A component that displays a verification badge if the user is verified.
 * @param {object} props - The component props.
 * @param {object} props.user - The user object, which may have a 'verified' property.
 */
function VerifiedUserBadge({ user }) {
  // This component will only render its output if user exists and user.verified is true.
  // Otherwise, it returns nothing (null).
  return (
    <>
      {user?.verified && (
        <CheckCircleIcon
          fontSize="inherit"
          color="primary"
          sx={{ ml: 0.5, verticalAlign: 'text-center' }} // Aligns icon with text
          title="Verified"
        />
      )}
    </>
  );
};

export default VerifiedUserBadge;