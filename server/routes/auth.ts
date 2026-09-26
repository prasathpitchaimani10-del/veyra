import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { findUserByEmail, createUser, findUserById, updateUser } from '../db';
import { generateToken, requireUser, AuthenticatedRequest } from '../middleware/auth';
import { User } from '../types';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res: Response) => {
  try {
    const { name, email, phone, password, confirmPassword } = req.body;

    if (!name || !email || !phone || !password || !confirmPassword) {
      res.status(400).json({ error: 'All fields are required.' });
      return;
    }

    if (typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({ error: 'Please enter a valid full name.' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    const phoneRegex = /^[0-9+()\- ]{7,18}$/;
    if (!phoneRegex.test(phone.trim())) {
      res.status(400).json({ error: 'Please enter a valid phone number.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters in length.' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ error: 'Passwords do not match.' });
      return;
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      res.status(409).json({ error: 'An account with this email address already exists. Please log in.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser: User = {
      _id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      passwordHash,
      createdAt: new Date().toISOString(),
      role: 'customer'
    };

    await createUser(newUser);

    const token = generateToken({
      id: newUser._id,
      email: newUser.email,
      role: 'customer'
    });

    res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        createdAt: newUser.createdAt,
        role: newUser.role
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Unable to process registration at this time. Please try again.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = await findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = generateToken({
      id: user._id,
      email: user.email,
      role: 'customer'
    });

    res.json({
      message: 'Logged in successfully.',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        createdAt: user.createdAt,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login service encountered an unexpected error.' });
  }
});

// GET /api/auth/me
router.get('/me', requireUser, async (req: AuthenticatedRequest, res: Response) => {
  res.json({ user: req.user });
});

// PUT /api/auth/profile
router.put('/profile', requireUser, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, phone } = req.body;
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const updates: Partial<User> = {};
    if (name && name.trim().length >= 2) updates.name = name.trim();
    if (phone && phone.trim().length >= 7) updates.phone = phone.trim();

    const updated = await updateUser(req.user._id, updates);
    if (!updated) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    const { passwordHash, ...safeUser } = updated;
    res.json({ message: 'Profile updated successfully.', user: safeUser });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

export default router;
