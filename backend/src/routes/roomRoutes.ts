import { Router } from "express";
import {
  createRoom,
  listRooms,
  joinRoom,
  leaveRoom,
  endRoom,
} from "../controllers/roomController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// All routes require authentication
router.use(protect);

router.post("/createRoom", createRoom);
router.get("/listRooms", listRooms);
router.post("/:roomIdOrName/join", joinRoom);
router.post("/:roomId/leave", leaveRoom);
router.post("/:roomId/end", endRoom);

export default router;
