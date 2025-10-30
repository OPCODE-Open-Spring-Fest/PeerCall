import type { Request, Response } from "express";
import Room from "../models/roomModel.js";
import type { IRoom } from "../models/roomModel.js";
import mongoose from "mongoose";
import { io } from "../server.js";


declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// ---------------------- Create Room ----------------------
export const createRoom = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Room name is required" });
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const existingRoom = await Room.findOne({ name });
    if (existingRoom)
      return res.status(400).json({ message: "Room with this name already exists" });

    const room: IRoom = new Room({ name, members: [req.userId] });
    await room.save();

    io.emit("room-created", { roomId: room._id, name: room.name });
    res.status(201).json(room);
  } catch (error: any) {
    console.error("Create room error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------------- List Rooms ----------------------
export const listRooms = async (_req: Request, res: Response) => {
  try {
    const rooms = await Room.find().populate("members", "username email");
    res.json(rooms);
  } catch (error: any) {
    console.error("List rooms error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------------- Join Room ----------------------
export const joinRoom = async (req: Request, res: Response) => {
  try {
    const roomIdOrName = req.params.roomIdOrName;
    const userId = req.userId;

    if (!roomIdOrName) return res.status(400).json({ message: "Room name or ID is required" });
    if (!userId) return res.status(401).json({ message: "Unauthorized - Missing userId" });

    let room = await Room.findOne({ name: roomIdOrName });
    if (!room && mongoose.Types.ObjectId.isValid(roomIdOrName)) {
      room = await Room.findById(roomIdOrName);
    }

    if (!room) {
      console.error("Join room error: Room not found for", roomIdOrName);
      return res.status(404).json({ message: "Room not found" });
    }

    const userObjId = new mongoose.Types.ObjectId(userId);
    if (!room.members.some(m => m.equals(userObjId))) {
      room.members.push(userObjId);
      await room.save();
    }

    const updatedRoom = await Room.findById(room._id).populate("members", "username email");
    io.to(room._id.toString()).emit("user-joined", { userId, roomId: room._id });
    io.to(room._id.toString()).emit("update-members", updatedRoom?.members || []);

    res.json(updatedRoom);
  } catch (error: any) {
    console.error("Join room error:", error.message, error.stack);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------------- Leave Room ----------------------
export const leaveRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = req.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const wasMember = room.members.some(m => m.toString() === userId);
    if (!wasMember)
      return res.status(400).json({ message: "You are not a member of this room" });

    room.members = room.members.filter(m => m.toString() !== userId);
    await room.save();

    io.to(roomId).emit("user-left", { userId, roomId });
    const updatedRoom = await Room.findById(roomId).populate("members", "username email");
    io.to(roomId).emit("update-members", updatedRoom?.members || []);

    if (room.members.length === 0) {
      await Room.findByIdAndDelete(roomId);
      io.to(roomId).emit("room-ended", { roomId, reason: "empty" });
      io.socketsLeave(roomId);
    }

    res.json({ message: "Left room successfully" });
  } catch (error: any) {
    console.error("Leave room error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ---------------------- End Room (Host Only) ----------------------
export const endRoom = async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    const userId = req.userId;

    if (!roomId) return res.status(400).json({ message: "Missing room ID" });
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });

    const hostId = room.members[0]?.toString();
    if (hostId !== userId)
      return res.status(403).json({ message: "Only the host can end the room" });

    await Room.findByIdAndDelete(roomId);
    io.to(roomId).emit("room-ended", { roomId, endedBy: userId });
    io.socketsLeave(roomId);

    res.json({ message: "Room ended successfully" });
  } catch (error: any) {
    console.error("End room error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
