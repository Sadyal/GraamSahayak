// Middleware to restrict access based on roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this resource`,
      });
    }

    // Enforce that village administrators must be approved
    if (req.user.role === 'Admin' && req.user.status !== 'Approved') {
      return res.status(403).json({
        success: false,
        message: `Your administrator account status is '${req.user.status}'. You are not authorized to perform this action.`,
      });
    }

    next();
  };
};

module.exports = { authorize };
