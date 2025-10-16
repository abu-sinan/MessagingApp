import Message from '../models/Message.js';
import User from '../models/User.js';

export const setupSocketHandlers = (io) => {
  const userSockets = new Map(); // userId -> socketId

  io.on('connection', (socket) => {
    console.log(`User ${socket.user.username} connected`);

    // Store user socket
    userSockets.set(socket.userId.toString(), socket.id);

    // Update user online status
    User.findByIdAndUpdate(socket.userId, { 
      isOnline: true,
      lastSeen: new Date()
    }).exec();

    // Notify others about user coming online
    socket.broadcast.emit('user_online', {
      userId: socket.userId,
      isOnline: true
    });

    // Join user to their personal room
    socket.join(socket.userId.toString());

    // Handle sending messages
    socket.on('send_message', async (data) => {
      try {
        const { receiverId, text } = data;

        // Save message to database
        const message = new Message({
          senderId: socket.userId,
          receiverId,
          text,
          status: 'sent'
        });

        await message.save();
        await message.populate('senderId', 'username avatar');
        await message.populate('receiverId', 'username avatar');

        // Emit to receiver if online
        const receiverSocketId = userSockets.get(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('new_message', message);
          message.status = 'delivered';
          await message.save();
        }

        // Emit back to sender for confirmation
        socket.emit('message_sent', message);

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing_start', (data) => {
      const { receiverId } = data;
      const receiverSocketId = userSockets.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', {
          userId: socket.userId,
          isTyping: true
        });
      }
    });

    socket.on('typing_stop', (data) => {
      const { receiverId } = data;
      const receiverSocketId = userSockets.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', {
          userId: socket.userId,
          isTyping: false
        });
      }
    });

    // Handle message read receipts
    socket.on('mark_messages_read', async (data) => {
      try {
        const { senderId } = data;

        await Message.updateMany(
          {
            senderId,
            receiverId: socket.userId,
            status: { $in: ['sent', 'delivered'] }
          },
          { status: 'read' }
        );

        // Notify sender that messages were read
        const senderSocketId = userSockets.get(senderId);
        if (senderSocketId) {
          io.to(senderSocketId).emit('messages_read', {
            readerId: socket.userId,
            senderId
          });
        }
      } catch (error) {
        console.error('Mark messages read error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${socket.user.username} disconnected`);

      userSockets.delete(socket.userId.toString());

      // Update user offline status
      await User.findByIdAndUpdate(socket.userId, { 
        isOnline: false,
        lastSeen: new Date()
      });

      // Notify others about user going offline
      socket.broadcast.emit('user_offline', {
        userId: socket.userId,
        isOnline: false,
        lastSeen: new Date()
      });
    });
  });
};
