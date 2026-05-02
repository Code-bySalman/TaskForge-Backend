import User from '../models/User.js';

export const roleCheck = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({ message: 'Access denied: insufficient permissions' });
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};
