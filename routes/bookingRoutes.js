import express from 'express';
import Booking from '../models/Booking.js';
import verifyToken from '../middleware/verifyToken.js';
import verifyAdmin from '../middleware/verifyAdmin.js';

const router = express.Router();

router.get('/my-bookings', verifyToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.get('/check/:classId', verifyToken, async (req, res) => {
  try {
    const booking = await Booking.findOne({ classId: req.params.classId, userId: req.user.userId });
    res.json({ booked: !!booking });
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.get('/all', verifyAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    if (req.user.status === 'blocked') return res.status(403).json({ message: 'Action restricted by Admin.' });
    const exists = await Booking.findOne({ classId: req.body.classId, userId: req.user.userId });
    if (exists) return res.status(400).json({ message: 'You have already booked this class.' });
    const booking = await Booking.create({ ...req.body, userId: req.user.userId, userEmail: req.user.email });
    res.status(201).json(booking);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

export default router;
