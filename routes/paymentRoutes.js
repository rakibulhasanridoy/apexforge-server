import express from 'express';
import Stripe from 'stripe';
import Transaction from '../models/Transaction.js';
import Class from '../models/Class.js';
import verifyToken from '../middleware/verifyToken.js';
import verifyAdmin from '../middleware/verifyAdmin.js';

const router = express.Router();

// Create Stripe payment intent
router.post('/create-payment-intent', verifyToken, async (req, res) => {
  try {
    if (req.user.status === 'blocked') return res.status(403).json({ message: 'Action restricted by Admin.' });
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const { amount } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ message: 'Payment initialization failed' });
  }
});

// Save transaction record after successful payment
router.post('/save-transaction', verifyToken, async (req, res) => {
  try {
    const { classId, className, amount, transactionId } = req.body;
    const transaction = await Transaction.create({
      userId: req.user.userId,
      userEmail: req.user.email,
      classId, className, amount, transactionId,
      status: 'succeeded',
    });
    // Increment booking count
    await Class.findByIdAndUpdate(classId, { $inc: { bookingCount: 1 } });
    res.status(201).json(transaction);
  } catch (error) {
    console.error('Transaction save error:', error);
    res.status(500).json({ message: 'Failed to save transaction' });
  }
});

// All transactions (admin)
router.get('/transactions', verifyAdmin, async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.json(transactions);
  } catch { res.status(500).json({ message: 'Server error' }); }
});

export default router;
