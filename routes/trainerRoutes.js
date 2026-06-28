import express from 'express';
import TrainerApplication from '../models/TrainerApplication.js';
import UserProfile from '../models/UserProfile.js';
import Favorite from '../models/Favorite.js';
import verifyToken from '../middleware/verifyToken.js';
import verifyAdmin from '../middleware/verifyAdmin.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// /apply/status and /applications must come before /apply to avoid route conflicts
router.get('/apply/status', verifyToken, asyncHandler(async (req, res) => {
  const application = await TrainerApplication.findOne({ userId: req.user.userId });
  res.json(application);
}));

router.get('/applications', verifyAdmin, asyncHandler(async (req, res) => {
  const applications = await TrainerApplication.find({ status: 'Pending' }).sort({ createdAt: -1 });
  res.json(applications);
}));

router.post('/apply', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.status === 'blocked') return res.status(403).json({ message: 'Action restricted by Admin.' });
  const existing = await TrainerApplication.findOne({ userId: req.user.userId, status: 'Pending' });
  if (existing) return res.status(400).json({ message: 'You already have a pending application.' });
  const application = await TrainerApplication.findOneAndUpdate(
    { userId: req.user.userId },
    { ...req.body, userId: req.user.userId, userEmail: req.user.email, status: 'Pending' },
    { upsert: true, new: true }
  );
  res.status(201).json(application);
}));

router.patch('/applications/:id/approve', verifyAdmin, asyncHandler(async (req, res) => {
  const application = await TrainerApplication.findByIdAndUpdate(
    req.params.id,
    { status: 'Approved', feedback: req.body.feedback || 'Approved!' },
    { new: true }
  );
  if (!application) return res.status(404).json({ message: 'Application not found' });
  // TODO: send an approval email to the applicant
  await UserProfile.findOneAndUpdate({ userId: application.userId }, { role: 'trainer' });
  res.json(application);
}));

router.patch('/applications/:id/reject', verifyAdmin, asyncHandler(async (req, res) => {
  const application = await TrainerApplication.findByIdAndUpdate(
    req.params.id,
    { status: 'Rejected', feedback: req.body.feedback },
    { new: true }
  );
  if (!application) return res.status(404).json({ message: 'Application not found' });
  res.json(application);
}));

// TODO: paginate this — currently returns all trainers with no limit
router.get('/all', verifyAdmin, asyncHandler(async (req, res) => {
  const trainers = await UserProfile.find({ role: 'trainer' });
  res.json(trainers);
}));

router.get('/favorites', verifyToken, asyncHandler(async (req, res) => {
  const favorites = await Favorite.find({ userId: req.user.userId });
  res.json(favorites);
}));

router.get('/favorites/check/:classId', verifyToken, asyncHandler(async (req, res) => {
  const fav = await Favorite.findOne({ userId: req.user.userId, classId: req.params.classId });
  res.json({ isFavorite: !!fav });
}));

router.post('/favorites', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.status === 'blocked') return res.status(403).json({ message: 'Action restricted by Admin.' });
  // Duplicate key (11000) is handled by errorMiddleware
  const favorite = await Favorite.findOneAndUpdate(
    { userId: req.user.userId, classId: req.body.classId },
    { userId: req.user.userId, ...req.body },
    { upsert: true, new: true }
  );
  res.status(201).json(favorite);
}));

router.delete('/favorites/:classId', verifyToken, asyncHandler(async (req, res) => {
  await Favorite.findOneAndDelete({ userId: req.user.userId, classId: req.params.classId });
  res.json({ message: 'Removed from favorites' });
}));

export default router;
