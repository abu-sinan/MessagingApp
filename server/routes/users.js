import express from 'express';
import { authenticate } from '../middleware/auth.js';
import User from '../models/User.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

const router = express.Router();

// Get all users (except current user)
router.get('/', authenticate, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user._id } })
      .select('username avatar status isOnline lastSeen');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('username avatar status isOnline lastSeen');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { username, status } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { username, status },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload avatar
router.post('/avatar', authenticate, async (req, res) => {
  try {
    if (!req.files || !req.files.avatar) {
      return res.status(400).json({ message: 'No avatar file uploaded' });
    }

    const avatarFile = req.files.avatar;
    const result = await uploadToCloudinary(avatarFile);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: result.secure_url },
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ message: 'Avatar upload failed' });
  }
});

export default router;
