import verifyToken from './verifyToken.js';

const verifyAdmin = [
  verifyToken,
  (req, res, next) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
  },
];

export default verifyAdmin;
