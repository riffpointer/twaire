function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  }

  console.warn("Unauthorized access attempt", {
    path: req.originalUrl,
    method: req.method,
  });

  res.status(401).json({
    success: false,
    error: "Not authenticated",
  });
}

export default isAuthenticated;