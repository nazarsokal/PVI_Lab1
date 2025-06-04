const express = require('express');
const path = require('path');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

// Припустимо, що список студентів завантажується звідкись (заміни на свій спосіб завантаження)
const axios = require('axios');
const students = []; // Тут буде масив студентів, наприклад, з API

const app = express();
const port = 3000;
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost', 'http://localhost:5500'],
    methods: ['GET', 'POST']
  }
});

app.use(express.json());
app.use(cors({
  origin: ['http://localhost', 'http://localhost:5500'],
  methods: ['GET', 'POST'],
  credentials: false
}));

const userSocketMap = new Map(); // Maps userId (string) to socket.id
const userStatusMap = new Map(); // Maps userId (string) to status ('online' or 'offline')

// Завантажуємо студентів (заміни URL на свій API-ендпоінт)
async function loadStudents() {
  try {
    const response = await axios.get('http://localhost/server/api/students/index');
    return response.data.map(student => ({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      gender: student.gender,
      birthday: student.birthday
    }));
  } catch (error) {
    console.error('Error loading students:', error);
    return [];
  }
}

// Ініціалізація студентів і статусів при старті
loadStudents().then(data => {
  students.length = 0; // Очищаємо масив
  students.push(...data); // Заповнюємо масив студентами
  console.log('Students loaded:', students.length);
  students.forEach(student => {
    userStatusMap.set(student.id, 'offline'); // Ініціалізуємо всіх як offline
  });
});
// MongoDB connection with retry
const connectMongoDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/messenger', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    setTimeout(connectMongoDB, 5000); // Retry after 5 seconds
  }
};
connectMongoDB();

// Message schema
const messageSchema = new mongoose.Schema({
  fromUserId: { type: String, required: true },
  toUserId: { type: String, default: null }, // Null for group messages
  groupId: { type: String, default: null }, // For group messages
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

// Group schema
const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  participants: [{ type: String }], // Array of user IDs
  creatorId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Group = mongoose.model('Group', groupSchema);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API to fetch messages for a conversation or group
app.get('/api/messages', async (req, res) => {
  const { userId, otherUserId, groupId } = req.query;
  if (!userId || (!otherUserId && !groupId)) {
    return res.status(400).json({ error: 'Missing userId, otherUserId, or groupId' });
  }
  if (groupId && !mongoose.Types.ObjectId.isValid(groupId)) {
    return res.status(400).json({ error: 'Invalid groupId' });
  }

  try {
    let messages;
    if (groupId) {
      messages = await Message.find({ groupId }).sort({ timestamp: 1 });
    } else {
      messages = await Message.find({
        $or: [
          { fromUserId: userId, toUserId: otherUserId },
          { fromUserId: otherUserId, toUserId: userId }
        ]
      }).sort({ timestamp: 1 });
    }
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', {
      error: err.message,
      stack: err.stack,
      query: { userId, otherUserId, groupId }
    });
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// API to create a group
app.post('/api/groups', async (req, res) => {
  const { name, participants, creatorId } = req.body;
  if (!name || !participants || !creatorId) {
    return res.status(400).json({ error: 'Missing name, participants, or creatorId' });
  }
  if (!Array.isArray(participants) || participants.some(id => typeof id !== 'string')) {
    return res.status(400).json({ error: 'Invalid participants array' });
  }

  try {
    const group = new Group({ name, participants, creatorId });
    await group.save();
    res.json(group);
  } catch (err) {
    console.error('Error creating group:', {
      error: err.message,
      stack: err.stack,
      body: req.body
    });
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// API to fetch all groups
app.get('/api/groups', async (req, res) => {
  try {
    const groups = await Group.find();
    res.json(groups);
  } catch (err) {
    console.error('Error fetching groups:', {
      error: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

// API to fetch user statuses
app.get('/api/user-status', (req, res) => {
  const userStatuses = {};
  students.forEach(student => {
    const status = userStatusMap.get(student.id) || 'offline';
    userStatuses[student.id] = status;
  });
  res.json(userStatuses);
});

// API to fetch user statuses
app.get('/api/user-status', (req, res) => {
  const userStatuses = {};
  students.forEach(student => {
    const status = userStatusMap.get(student.id) || 'offline';
    userStatuses[student.id] = status;
  });
  res.json(userStatuses);
});

// Socket.io logic
io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  socket.on('register', (userId) => {
    userSocketMap.set(userId, socket.id);
    userStatusMap.set(userId, 'online');
    console.log(`User ${userId} registered with socket ${socket.id} and set to online`);
    io.emit('user status update', { userId, status: 'online' }); // Broadcast status change
  });

  socket.on('chat message', async (data) => {
    console.log('Message received:', data);
    const { text, toUserId, fromUserId, groupId } = data;

    if (!text || !fromUserId || (!toUserId && !groupId)) {
      console.log('Invalid message data:', data);
      return;
    }
    if (groupId && !mongoose.Types.ObjectId.isValid(groupId)) {
      console.log('Invalid groupId:', groupId);
      return;
    }

    try {
      const message = new Message({ fromUserId, toUserId, groupId, text });
      await message.save();
      console.log(`Message saved: ${fromUserId} -> ${groupId || toUserId}: ${text}`);
    } catch (err) {
      console.error('Error saving message:', {
        error: err.message,
        stack: err.stack,
        data
      });
      return;
    }

    if (groupId) {
      try {
        const group = await Group.findById(groupId);
        if (group) {
          group.participants.forEach(participantId => {
            const socketId = userSocketMap.get(participantId);
            if (socketId) {
              io.to(socketId).emit('chat message', {
                text,
                fromUserId,
                groupId,
                timestamp: new Date()
              });
              console.log(`Message sent to ${participantId} (socket ${socketId})`);
            }
          });
        } else {
          console.log(`Group ${groupId} not found`);
        }
      } catch (err) {
        console.error('Error fetching group:', err.message);
      }
    } else {
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
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (let [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        userStatusMap.set(userId, 'offline');
        io.emit('user status update', { userId, status: 'offline' }); // Broadcast status change
        console.log(`User ${userId} set to offline and removed from userSocketMap`);
      }
    }
  });
});

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});