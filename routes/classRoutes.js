import express from 'express';
import Class from '../models/Class.js';
import Booking from '../models/Booking.js';
import verifyToken from '../middleware/verifyToken.js';
import verifyAdmin from '../middleware/verifyAdmin.js';
import verifyTrainer from '../middleware/verifyTrainer.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// Public — search, filter, pagination
router.get('/', asyncHandler(async (req, res) => {
  const { page = 1, limit = 9, search = '', category = '' } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);
  const filter = { status: 'Approved' };
  if (search) filter.className = { $regex: search, $options: 'i' };
  if (category && category !== 'All') filter.category = { $in: [category] };
  const [classes, total] = await Promise.all([
    Class.find(filter).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
    Class.countDocuments(filter),
  ]);
  res.json({ classes, total, pages: Math.ceil(total / parseInt(limit)), currentPage: parseInt(page) });
}));

// Public — top 6 by booking count for the homepage
router.get('/featured', asyncHandler(async (req, res) => {
  const classes = await Class.find({ status: 'Approved' }).sort({ bookingCount: -1 }).limit(6);
  res.json(classes);
}));

// /stats and /trainer-stats must come before /:id or Express treats them as IDs
router.get('/stats', verifyAdmin, asyncHandler(async (req, res) => {
  const totalClasses = await Class.countDocuments();
  const totalBookings = await Booking.countDocuments();
  res.json({ totalClasses, totalBookings });
}));

router.get('/trainer-stats', verifyTrainer, asyncHandler(async (req, res) => {
  const totalClasses = await Class.countDocuments({ trainerId: req.user.userId });
  const trainerClasses = await Class.find({ trainerId: req.user.userId }, '_id');
  const classIds = trainerClasses.map(c => c._id);
  const totalStudents = await Booking.countDocuments({ classId: { $in: classIds } });
  res.json({ totalClasses, totalStudents });
}));

router.get('/all', verifyAdmin, asyncHandler(async (req, res) => {
  const classes = await Class.find().sort({ createdAt: -1 });
  res.json(classes);
}));

router.get('/my-classes', verifyTrainer, asyncHandler(async (req, res) => {
  const classes = await Class.find({ trainerId: req.user.userId }).sort({ createdAt: -1 });
  res.json(classes);
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const cls = await Class.findById(req.params.id);
  if (!cls) return res.status(404).json({ message: 'Class not found' });
  res.json(cls);
}));

router.post('/', verifyTrainer, asyncHandler(async (req, res) => {
  if (req.user.status === 'blocked') return res.status(403).json({ message: 'Action restricted by Admin.' });
  const newClass = await Class.create({ ...req.body, trainerId: req.user.userId, status: 'Pending' });
  res.status(201).json(newClass);
}));

router.put('/:id', verifyTrainer, asyncHandler(async (req, res) => {
  const cls = await Class.findOneAndUpdate(
    { _id: req.params.id, trainerId: req.user.userId },
    req.body, { new: true }
  );
  if (!cls) return res.status(404).json({ message: 'Class not found or not authorized' });
  res.json(cls);
}));

router.delete('/:id', verifyToken, asyncHandler(async (req, res) => {
  const query = req.user.role === 'admin'
    ? { _id: req.params.id }
    : { _id: req.params.id, trainerId: req.user.userId };
  const cls = await Class.findOneAndDelete(query);
  if (!cls) return res.status(404).json({ message: 'Class not found' });
  res.json({ message: 'Class deleted successfully' });
}));

router.patch('/:id/status', verifyAdmin, asyncHandler(async (req, res) => {
  const cls = await Class.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  res.json(cls);
}));

router.get('/:id/students', verifyTrainer, asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ classId: req.params.id });
  res.json(bookings);
}));

export default router;
