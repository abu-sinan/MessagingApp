import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Message from '../models/Message.js';

const router = express.Router();

// Get messages between two users
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({
      $or: [
        { senderId: req.user._id, receiverId: userId },
        { senderId: userId, receiverId: req.user._id }
      ]
    })
    .populate('senderId', 'username avatar')
    .populate('receiverId', 'username avatar')
    .sort({ timestamp: -1 })
    .skip(skip)
    .limit(limit);

    res.json(messages.reverse());
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
router.put('/read/:senderId', authenticate, async (req, res) => {
  try {
    const { senderId } = req.params;

    await Message.updateMany(
      {
        senderId,
        receiverId: req.user._id,
        status: { $in: ['sent', 'delivered'] }
      },
      { status: 'read' }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark messages as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
