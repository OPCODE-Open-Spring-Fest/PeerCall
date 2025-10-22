import mongoose from "mongoose";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/peercall";

app.use(express.json());
app.use(cors());

const chatMessages = [];

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-room", (roomId, userName) => {
    socket.join(roomId);
    console.log(`${userName} joined room ${roomId}`);
    const roomMessages = chatMessages.filter(msg => msg.roomId === roomId);
    socket.emit("chat-history", roomMessages.slice(-50));
  });

  socket.on("chat-message", ({ roomId, user, text }) => {
    const message = {
      roomId,
      user,
      text,
      time: new Date(),
      id: Date.now()
    };
    chatMessages.push(message);
    io.to(roomId).emit("chat-message", message);
    console.log(`Message in ${roomId} from ${user}: ${text}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Chat server is running" });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Chat server running on port ${PORT}`);
  console.log(`📡 Socket.io ready for real-time chat`);
  console.log(`💬 Chat overlay feature is active!`);
});

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down chat server...');
  httpServer.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
