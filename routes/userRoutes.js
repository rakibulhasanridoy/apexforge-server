import express from 'express';
import UserProfile from '../models/UserProfile.js';
import verifyToken from '../middleware/verifyToken.js';
import verifyAdmin from '../middleware/verifyAdmin.js';

const router = express.Router();

// Get all users (admin)
router.get('/', verifyAdmin, async (req, res) => {
  try {
    const users = await UserProfile.find().sort({ createdAt: -1 });
    res.json(users);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Get own profile
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ userId: req.user.userId });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Admin stats
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const totalUsers = await UserProfile.countDocuments();
    res.json({ totalUsers });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Block / Unblock user
router.patch('/:userId/status', verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const profile = await UserProfile.findOneAndUpdate({ userId: req.params.userId }, { status }, { new: true });
    res.json(profile);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Make admin
router.patch('/:userId/make-admin', verifyAdmin, async (req, res) => {
  try {
    const profile = await UserProfile.findOneAndUpdate({ userId: req.params.userId }, { role: 'admin' }, { new: true });
    res.json(profile);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Demote trainer to user
router.patch('/:userId/demote', verifyAdmin, async (req, res) => {
  try {
    const profile = await UserProfile.findOneAndUpdate({ userId: req.params.userId }, { role: 'user' }, { new: true });
    res.json(profile);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

export default router;
