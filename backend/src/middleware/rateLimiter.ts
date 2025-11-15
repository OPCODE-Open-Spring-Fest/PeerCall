import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";
import logger from "../utils/logger.js";

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5,
  standardHeaders: true, 
  legacyHeaders: false, 
  handler: (req: Request, res: Response) => {
    const clientIP = req.ip || req.socket.remoteAddress || "unknown";
    logger.warn(
      `Rate limit exceeded for IP: ${clientIP} on ${req.method} ${req.originalUrl}`
    );
    
    const retryAfter = req.rateLimit?.resetTime 
      ? Math.round((req.rateLimit.resetTime - Date.now()) / 1000)
      : 900; 
    
    res.status(429).json({
      success: false,
      message: "Too many authentication attempts. Please try again after 15 minutes.",
      retryAfter,
    });
  },
  keyGenerator: (req: Request) => {
    return req.ip || req.socket.remoteAddress || "unknown";
  },
});

