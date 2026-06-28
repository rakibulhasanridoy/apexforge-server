import express from 'express';
import Stripe from 'stripe';
import Transaction from '../models/Transaction.js';
import Class from '../models/Class.js';
import verifyToken from '../middleware/verifyToken.js';
import verifyAdmin from '../middleware/verifyAdmin.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

router.post('/create-payment-intent', verifyToken, asyncHandler(async (req, res) => {
  if (req.user.status === 'blocked') return res.status(403).json({ message: 'Action restricted by Admin.' });
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const { amount } = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'usd',
    automatic_payment_methods: { enabled: true },
  });
  res.json({ clientSecret: paymentIntent.client_secret });
}));

router.post('/save-transaction', verifyToken, asyncHandler(async (req, res) => {
  const { classId, className, amount, transactionId } = req.body;
  const transaction = await Transaction.create({
    userId: req.user.userId,
    userEmail: req.user.email,
    classId, className, amount, transactionId,
    status: 'succeeded',
  });
  await Class.findByIdAndUpdate(classId, { $inc: { bookingCount: 1 } });
  res.status(201).json(transaction);
}));

router.get('/transactions', verifyAdmin, asyncHandler(async (req, res) => {
  const transactions = await Transaction.find().sort({ createdAt: -1 });
  res.json(transactions);
}));

export default router;
