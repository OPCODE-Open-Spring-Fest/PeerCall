import type { Request, Response } from "express";
import Room from "../models/roomModel.js";
import type { IRoom } from "../models/roomModel.js";
import * as express from "express";
import mongoose from "mongoose";

declare global {
    namespace Express {
        interface Request {
            userId?: string; // or number, depending on your ID type
        }
    }
}

// Create a new room
export const createRoom = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: "Room name is required" });

        const existingRoom = await Room.findOne({ name });
        if (existingRoom) return res.status(400).json({ message: "Room already exists" });

        const room: IRoom = new Room({ name, members: [req.userId] });
        await room.save();
        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// List all rooms
export const listRooms = async (_req: Request, res: Response) => {
    try {
        const rooms = await Room.find().populate("members", "username email");
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Join a room
export const joinRoom = async (req: Request, res: Response) => {
    try {
        const { roomId } = req.params;
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: "Room not found" });
        const userId = new mongoose.Types.ObjectId(req.userId!);
        if (!room.members.includes(userId)) {
            room.members.push(userId);
            await room.save();
        }

        res.json(room);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Leave a room
export const leaveRoom = async (req: Request, res: Response) => {
    try {
        const { roomId } = req.params;
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: "Room not found" });

        room.members = room.members.filter(member => member.toString() !== req.userId);
        await room.save();

        res.json({ message: "Left room successfully", room });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
