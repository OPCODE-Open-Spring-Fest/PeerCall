import mongoose from "mongoose";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app.js"
import { ChatMessage } from "./models/chatMessageModel.js";

import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI as string;
// console.log(MONGO_URI)

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  socket.on("join-room", async (roomId, userName) => {
    socket.join(roomId);
    // Send recent chat history to the user
    try {
      const recentMessages = await ChatMessage.find({ roomId })
        .sort({ timestamp: -1 })
        .limit(50)
        .lean();
      socket.emit("chat-history", recentMessages.reverse());
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  });

  socket.on("chat-message", async ({ roomId, user, text }) => {
    try {
      // Save message to database
      const message = new ChatMessage({ roomId, user, text });
      await message.save();
      
      // Broadcast to all users in the room
      io.to(roomId).emit("chat-message", {
        user,
        text,
        time: new Date(),
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });
});

mongoose
    .connect(MONGO_URI)
    .then(() => {
        console.log(" MongoDB Connected");
        httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.error(" DB connection failed:", err));
