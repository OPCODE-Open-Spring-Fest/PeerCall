import { Router } from "express";
import { createRoom, listRooms, joinRoom, leaveRoom } from "../controllers/roomController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// All routes require authentication
router.use(protect);

router.post("/createRoom", createRoom);           // Create room
router.get("/listRooms", listRooms);             // List all rooms
router.post("/:roomId/join", joinRoom); // Join a room
router.post("/:roomId/leave", leaveRoom); // Leave a room

export default router;
