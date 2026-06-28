import express from 'express';
import Booking from '../models/Booking.js';
import verifyToken from '../middleware/verifyToken.js';
import verifyAdmin from '../middleware/verifyAdmin.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

router.get('/my-bookings', verifyToken, asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ userId: req.user.userId }).sort({ createdAt: -1 });
  res.json(bookings);
}));

router.get('/check/:classId', verifyToken, asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ classId: req.params.classId, userId: req.user.userId });
  res.json({ booked: !!booking });
}));

router.get('/all', verifyAdmin, asyncHandler(async (req, res) => {
  const bookings = await Booking.find().sort({ createdAt: -1 });
  res.json(bookings);
}));

router.post('/', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.status === 'blocked') return res.status(403).json({ message: 'Action restricted by Admin.' });

  const exists = await Booking.findOne({ classId: req.body.classId, userId: req.user.userId });
  if (exists) return res.status(400).json({ message: 'You have already booked this class.' });

  const booking = await Booking.create({ ...req.body, userId: req.user.userId, userEmail: req.user.email });
  res.status(201).json(booking);
}));

export default router;
