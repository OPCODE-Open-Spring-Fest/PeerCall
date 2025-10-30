import express from "express";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";

import { Session } from "./models/sessionModel.js";
import { ChatMessage } from "./models/chatMessageModel.js";
import Room from "./models/roomModel.js"; // ✅ Import for room events
import app from "./app.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI as string;

// ------------------- Server Setup -------------------
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: "*" },
});

// ------------------- Socket.io Events -------------------
io.on("connection", (socket) => {
  console.log(`🟢 User connected: ${socket.id}`);

  // ---------------- Join Room ----------------
  socket.on("join-room", async (roomId: string, userName: string) => {
    try {
      socket.join(roomId);
      console.log(`👥 ${userName} joined room ${roomId}`);

      // Notify others
      io.to(roomId).emit("user-joined", { userName, roomId });

      // Fetch recent chat messages
      const recentMessages = await ChatMessage.find({ roomId })
        .sort({ timestamp: -1 })
        .limit(50)
        .lean();
      socket.emit("chat-history", recentMessages.reverse());

      // Update members list
      const room = await Room.findById(roomId).populate("members", "username email");
      io.to(roomId).emit("update-members", room?.members || []);
    } catch (error) {
      console.error(`❌ Error fetching chat history for ${roomId}:`, error);
      socket.emit("error", { message: "Failed to fetch chat history." });
    }
  });

  // ---------------- Chat Message ----------------
  socket.on(
    "chat-message",
    async ({
      roomId,
      user,
      text,
    }: {
      roomId: string;
      user: string;
      text: string;
    }) => {
      try {
        const message = new ChatMessage({
          roomId,
          user,
          text,
          timestamp: new Date(),
        });
        await message.save();

        io.to(roomId).emit("chat-message", {
          roomId,
          user,
          text,
          time: message.timestamp,
        });

        console.log(`💬 [${roomId}] ${user}: ${text}`);
      } catch (error) {
        console.error(`❌ Error saving message for ${roomId}:`, error);
        socket.emit("error", { message: "Failed to send message." });
      }
    }
  );

  // ---------------- Leave Room ----------------
  socket.on(
    "leave-room",
    async ({
      roomId,
      userId,
      userName,
    }: {
      roomId: string;
      userId: string;
      userName: string;
    }) => {
      try {
        socket.leave(roomId);
        console.log(`🚪 ${userName} left room ${roomId}`);

        const room = await Room.findById(roomId);
        if (room) {
          room.members = room.members.filter((m) => m.toString() !== userId);
          await room.save();

          // Notify others
          io.to(roomId).emit("user-left", { userName, roomId });

          // Update member list
          const updatedRoom = await Room.findById(roomId).populate(
            "members",
            "username email"
          );
          io.to(roomId).emit("update-members", updatedRoom?.members || []);

          // Delete room if empty
          if (room.members.length === 0) {
            await Room.findByIdAndDelete(roomId);
            io.to(roomId).emit("room-ended", { roomId, reason: "empty" });
            io.socketsLeave(roomId);
            console.log(`💣 Room ${roomId} deleted (empty)`);
          }
        }
      } catch (error) {
        console.error("❌ Leave room error:", error);
      }
    }
  );

  // ---------------- End Room (Host Only) ----------------
  socket.on(
    "end-room",
    async ({ roomId, host }: { roomId: string; host: string }) => {
      try {
        await Room.findByIdAndDelete(roomId);
        io.to(roomId).emit("room-ended", { roomId, endedBy: host });
        io.socketsLeave(roomId);
        console.log(`💥 Room ${roomId} ended by host ${host}`);
      } catch (error) {
        console.error("❌ End room error:", error);
      }
    }
  );

  // ---------------- Disconnect ----------------
  socket.on("disconnect", () => {
    console.log(`🔴 User disconnected: ${socket.id}`);
  });
});

// ------------------- Express Routes -------------------
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "✅ Chat server is running and healthy!",
  });
});

// ------------------- MongoDB Connection -------------------
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("🗄️  MongoDB connected successfully!");
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.io real-time chat ready`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });

// ------------------- Export Socket.IO -------------------
export { io };
