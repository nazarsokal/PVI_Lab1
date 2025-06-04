const express = require('express');
const path = require('path');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const port = 3000;
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost',
    methods: ['GET', 'POST']
  }
});

app.use(express.json());
app.use(cors({
  origin: 'http://localhost',
  methods: ['GET', 'POST'],
  credentials: false
}));

const userSocketMap = new Map(); // Maps userId (string) to socket.id

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/messenger', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Message schema
const messageSchema = new mongoose.Schema({
  fromUserId: { type: String, required: true },
  toUserId: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API to fetch messages for a conversation
app.get('/api/messages', async (req, res) => {
  const { userId, otherUserId } = req.query;
  if (!userId || !otherUserId) {
    return res.status(400).json({ error: 'Missing userId or otherUserId' });
  }
  try {
    const messages = await Message.find({
      $or: [
        { fromUserId: userId, toUserId: otherUserId },
        { fromUserId: otherUserId, toUserId: userId }
      ]
    }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Socket.io logic
io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  // Register user ID
  socket.on('register', (userId) => {
    userSocketMap.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on('chat message', async (data) => {
    console.log('Message received:', data);
    const { text, toUserId, fromUserId } = data;

    // Validate data
    if (!text || !toUserId || !fromUserId) {
      console.log('Invalid message data:', data);
      return;
    }

    // Save message to MongoDB
    try {
      const message = new Message({ fromUserId, toUserId, text });
      await message.save();
      console.log(`Message saved: ${fromUserId} -> ${toUserId}: ${text}`);
    } catch (err) {
      console.error('Error saving message:', err);
      return;
    }

    // Send message to recipient
    const recipientSocketId = userSocketMap.get(toUserId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('chat message', {
        text,
        fromUserId,
        toUserId,
        timestamp: new Date()
      });
      console.log(`Message sent to ${toUserId} (socket ${recipientSocketId})`);
    } else {
      console.log(`Recipient ${toUserId} is offline`);
    }

    // Send message back to sender
    const senderSocketId = userSocketMap.get(fromUserId);
    if (senderSocketId) {
      io.to(senderSocketId).emit('chat message', {
        text,
        fromUserId,
        toUserId,
        timestamp: new Date()
      });
      console.log(`Message sent back to sender ${fromUserId} (socket ${senderSocketId})`);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (let [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        console.log(`User ${userId} removed from userSocketMap`);
      }
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});