function VerifiedUserBadge({ user, verticalAlign = "middle", className = "" }) {
  if (!user?.verified) return null;

  return (
    <i 
      className={`bi bi-patch-check-fill text-primary ms-1 ${className}`} 
      style={{ verticalAlign: verticalAlign }}
      title="Verified user"
    ></i>
  );
};

export default VerifiedUserBadge;