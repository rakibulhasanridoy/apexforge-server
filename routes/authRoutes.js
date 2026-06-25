import express from 'express';
import jwt from 'jsonwebtoken';
import { fromNodeHeaders } from 'better-auth/node';
import { getAuth } from '../lib/auth.js';
import UserProfile from '../models/UserProfile.js';

const router = express.Router();

router.post('/token', async (req, res) => {
  try {
    const auth = getAuth();
    const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!session?.user) return res.status(401).json({ message: 'Not authenticated' });

    const userImage = session.user.image || '';
    let profile = await UserProfile.findOne({ userId: session.user.id });

    if (!profile) {
      profile = await UserProfile.create({
        userId: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: userImage,
        role: 'user',
        status: 'active',
      });
    } else if (userImage && profile.image !== userImage) {
      profile = await UserProfile.findOneAndUpdate(
        { userId: session.user.id },
        { image: userImage, name: session.user.name },
        { new: true }
      );
    }

    const token = jwt.sign(
      { userId: profile.userId, email: profile.email, role: profile.role, status: profile.status },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      user: {
        userId: profile.userId,
        email: profile.email,
        name: profile.name,
        image: profile.image,
        role: profile.role,
        status: profile.status,
      }
    });
  } catch (error) {
    console.error('JWT token error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/logout', (req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  });
  res.json({ success: true });
});

export default router;
