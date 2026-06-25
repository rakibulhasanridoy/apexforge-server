import express from 'express';
import TrainerApplication from '../models/TrainerApplication.js';
import UserProfile from '../models/UserProfile.js';
import Favorite from '../models/Favorite.js';
import verifyToken from '../middleware/verifyToken.js';
import verifyAdmin from '../middleware/verifyAdmin.js';

const router = express.Router();

// Apply as trainer
router.post('/apply', verifyToken, async (req, res) => {
  try {
    if (req.user.status === 'blocked') return res.status(403).json({ message: 'Action restricted by Admin.' });
    const existing = await TrainerApplication.findOne({ userId: req.user.userId, status: 'Pending' });
    if (existing) return res.status(400).json({ message: 'You already have a pending application.' });
    const application = await TrainerApplication.findOneAndUpdate(
      { userId: req.user.userId },
      { ...req.body, userId: req.user.userId, userEmail: req.user.email, status: 'Pending' },
      { upsert: true, new: true }
    );
    res.status(201).json(application);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Get own application status
router.get('/apply/status', verifyToken, async (req, res) => {
  try {
    const application = await TrainerApplication.findOne({ userId: req.user.userId });
    res.json(application);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// All pending applications (admin)
router.get('/applications', verifyAdmin, async (req, res) => {
  try {
    const applications = await TrainerApplication.find({ status: 'Pending' }).sort({ createdAt: -1 });
    res.json(applications);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Approve application (admin)
router.patch('/applications/:id/approve', verifyAdmin, async (req, res) => {
  try {
    const application = await TrainerApplication.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved', feedback: req.body.feedback || 'Approved!' },
      { new: true }
    );
    if (!application) return res.status(404).json({ message: 'Application not found' });
    await UserProfile.findOneAndUpdate({ userId: application.userId }, { role: 'trainer' });
    res.json(application);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Reject application (admin)
router.patch('/applications/:id/reject', verifyAdmin, async (req, res) => {
  try {
    const application = await TrainerApplication.findByIdAndUpdate(
      req.params.id,
      { status: 'Rejected', feedback: req.body.feedback },
      { new: true }
    );
    if (!application) return res.status(404).json({ message: 'Application not found' });
    res.json(application);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// All active trainers (admin)
router.get('/all', verifyAdmin, async (req, res) => {
  try {
    const trainers = await UserProfile.find({ role: 'trainer' });
    res.json(trainers);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Favorites
router.get('/favorites', verifyToken, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.userId });
    res.json(favorites);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.get('/favorites/check/:classId', verifyToken, async (req, res) => {
  try {
    const fav = await Favorite.findOne({ userId: req.user.userId, classId: req.params.classId });
    res.json({ isFavorite: !!fav });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.post('/favorites', verifyToken, async (req, res) => {
  try {
    if (req.user.status === 'blocked') return res.status(403).json({ message: 'Action restricted by Admin.' });
    const favorite = await Favorite.findOneAndUpdate(
      { userId: req.user.userId, classId: req.body.classId },
      { userId: req.user.userId, ...req.body },
      { upsert: true, new: true }
    );
    res.status(201).json(favorite);
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ message: 'Already in favorites' });
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/favorites/:classId', verifyToken, async (req, res) => {
  try {
    await Favorite.findOneAndDelete({ userId: req.user.userId, classId: req.params.classId });
    res.json({ message: 'Removed from favorites' });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

export default router;
