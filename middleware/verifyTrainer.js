import verifyToken from './verifyToken.js';

const verifyTrainer = [
  verifyToken,
  (req, res, next) => {
    if (req.user?.role !== 'trainer' && req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Trainer role required.' });
    }
    next();
  },
];

export default verifyTrainer;
