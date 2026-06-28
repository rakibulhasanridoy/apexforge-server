import express from 'express';
import UserProfile from '../models/UserProfile.js';
import verifyToken from '../middleware/verifyToken.js';
import verifyAdmin from '../middleware/verifyAdmin.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// /profile and /stats must stay above /:userId to avoid being matched as IDs
router.get('/profile', verifyToken, asyncHandler(async (req, res) => {
  const profile = await UserProfile.findOne({ userId: req.user.userId });
  if (!profile) return res.status(404).json({ message: 'Profile not found' });
  res.json(profile);
}));

router.get('/stats', verifyAdmin, asyncHandler(async (req, res) => {
  const totalUsers = await UserProfile.countDocuments();
  res.json({ totalUsers });
}));

router.get('/', verifyAdmin, asyncHandler(async (req, res) => {
  const users = await UserProfile.find().sort({ createdAt: -1 });
  res.json(users);
}));

router.patch('/:userId/status', verifyAdmin, asyncHandler(async (req, res) => {
  const { status } = req.body;
  const profile = await UserProfile.findOneAndUpdate(
    { userId: req.params.userId },
    { status },
    { new: true }
  );
  if (!profile) return res.status(404).json({ message: 'User not found' });
  res.json(profile);
}));

router.patch('/:userId/make-admin', verifyAdmin, asyncHandler(async (req, res) => {
  const profile = await UserProfile.findOneAndUpdate(
    { userId: req.params.userId },
    { role: 'admin' },
    { new: true }
  );
  if (!profile) return res.status(404).json({ message: 'User not found' });
  res.json(profile);
}));

router.patch('/:userId/demote', verifyAdmin, asyncHandler(async (req, res) => {
  const profile = await UserProfile.findOneAndUpdate(
    { userId: req.params.userId },
    { role: 'user' },
    { new: true }
  );
  if (!profile) return res.status(404).json({ message: 'User not found' });
  res.json(profile);
}));

export default router;
