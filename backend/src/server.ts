import express from "express";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";

import { Session } from "./models/sessionModel.js";
import { ChatMessage } from "./models/chatMessageModel.js"; // <-- make sure this file exists and exports model
import app from "./app.js";

dotenv.config();

// // ------------------- App Setup -------------------
// const app = express();
// app.use(express.json());
// app.use(cors());

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

  socket.on("join-room", async (roomId: string, userName: string) => {
    try {
      socket.join(roomId);
      console.log(`👥 ${userName} joined room ${roomId}`);

      // Fetch last 50 messages from DB
      const recentMessages = await ChatMessage.find({ roomId })
        .sort({ timestamp: -1 })
        .limit(50)
        .lean();

      // Send history in correct order (oldest → newest)
      socket.emit("chat-history", recentMessages.reverse());
    } catch (error) {
      console.error(`❌ Error fetching chat history for ${roomId}:`, error);
      socket.emit("error", { message: "Failed to fetch chat history." });
    }
  });

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
        // Save message to MongoDB
        const message = new ChatMessage({
          roomId,
          user,
          text,
          timestamp: new Date(),
        });
        await message.save();

        // Broadcast message to everyone in the room
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


    // cron.schedule("0 2 * * *", async () => {
    //   const expiryDate = new Date();
    //   expiryDate.setDate(expiryDate.getDate() - 7);
    //   try {
    //     const result = await Session.deleteMany({ createdAt: { $lt: expiryDate } });
    //     console.log(`🧹 Cleanup complete — ${result.deletedCount} expired sessions removed`);
    //   } catch (error) {
    //     console.error("❌ Session cleanup failed:", error);
    //   }
    // });


    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.io real-time chat ready`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err);
    process.exit(1);
  });

// // ------------------- Graceful Shutdown -------------------
// process.on("SIGINT", () => {
//   console.log("\n🛑 Shutting down chat server...");
//   httpServer.close(() => {
//     console.log("✅ HTTP server closed.");
//     mongoose.connection.close(false, () => {
//       console.log("🗄️ MongoDB connection closed.");
//       process.exit(0);
//     });
//   });
// });
