import express from 'express';
import Class from '../models/Class.js';
import Booking from '../models/Booking.js';
import verifyToken from '../middleware/verifyToken.js';
import verifyAdmin from '../middleware/verifyAdmin.js';
import verifyTrainer from '../middleware/verifyTrainer.js';

const router = express.Router();

// Get approved classes - public (search, filter, pagination)
router.get('/', async (req, res) => {
  try {
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
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Featured classes by booking count - public
router.get('/featured', async (req, res) => {
  try {
    const classes = await Class.find({ status: 'Approved' }).sort({ bookingCount: -1 }).limit(6);
    res.json(classes);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Admin - all classes
router.get('/all', verifyAdmin, async (req, res) => {
  try {
    const classes = await Class.find().sort({ createdAt: -1 });
    res.json(classes);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Trainer - own classes
router.get('/my-classes', verifyTrainer, async (req, res) => {
  try {
    const classes = await Class.find({ trainerId: req.user.userId }).sort({ createdAt: -1 });
    res.json(classes);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Stats for admin
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const totalClasses = await Class.countDocuments();
    const totalBookings = await Booking.countDocuments();
    res.json({ totalClasses, totalBookings });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Trainer overview stats
router.get('/trainer-stats', verifyTrainer, async (req, res) => {
  try {
    const totalClasses = await Class.countDocuments({ trainerId: req.user.userId });
    const trainerClasses = await Class.find({ trainerId: req.user.userId }, '_id');
    const classIds = trainerClasses.map(c => c._id);
    const totalStudents = await Booking.countDocuments({ classId: { $in: classIds } });
    res.json({ totalClasses, totalStudents });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Single class - public
router.get('/:id', async (req, res) => {
  try {
    const cls = await Class.findById(req.params.id);
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    res.json(cls);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Create class (trainer)
router.post('/', verifyTrainer, async (req, res) => {
  try {
    if (req.user.status === 'blocked') return res.status(403).json({ message: 'Action restricted by Admin.' });
    const newClass = await Class.create({ ...req.body, trainerId: req.user.userId, status: 'Pending' });
    res.status(201).json(newClass);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Update class (trainer)
router.put('/:id', verifyTrainer, async (req, res) => {
  try {
    const cls = await Class.findOneAndUpdate(
      { _id: req.params.id, trainerId: req.user.userId },
      req.body, { new: true }
    );
    if (!cls) return res.status(404).json({ message: 'Class not found or not authorized' });
    res.json(cls);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Delete class
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? { _id: req.params.id }
      : { _id: req.params.id, trainerId: req.user.userId };
    const cls = await Class.findOneAndDelete(query);
    if (!cls) return res.status(404).json({ message: 'Class not found' });
    res.json({ message: 'Class deleted successfully' });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Admin approve/reject
router.patch('/:id/status', verifyAdmin, async (req, res) => {
  try {
    const cls = await Class.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    res.json(cls);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

// Get students for a class (trainer)
router.get('/:id/students', verifyTrainer, async (req, res) => {
  try {
    const bookings = await Booking.find({ classId: req.params.id });
    res.json(bookings);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

export default router;
