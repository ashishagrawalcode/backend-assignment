// This function runs before routes that require login.
export function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Please log in first" });
  }

  next(); // Continue to the controller if a user is logged in.
}
