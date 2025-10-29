import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Session } from "../models/sessionModel.js";

interface AuthRequest extends Request {
  userId?: string;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized — token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string) as { id: string };

    const activeSession = await Session.findOne({ token });
    if (!activeSession) {
      return res.status(401).json({
        success: false,
        message: "Session expired or invalid",
      });
    }

    // If expired then remove it
    if (activeSession.expiresAt < new Date()) {
      await Session.deleteOne({ token });
      return res.status(401).json({
        success: false,
        message: "Session expired",
      });
    }

    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};