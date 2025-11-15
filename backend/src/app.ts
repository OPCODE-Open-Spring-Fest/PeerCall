import dotenv from "dotenv";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import roomRoutes from "./routes/roomRoutes.js";
import passport from "passport";
import "./utils/passport.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

dotenv.config();
const app = express();

// Required for __dirname in ES modules / TS
// (TS compiles to CJS so this works fine)
const __dirnameLocal = path.resolve();

app.use(requestLogger);
app.use(express.json());
app.use(cookieParser());

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5174",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// Passport
app.use(passport.initialize());

// Uploaded avatars: stored in /uploads/avatars
app.use(
  "/avatars",
  express.static(path.join(__dirnameLocal, "uploads", "avatars"))
);

// Default avatars: stored in /public/default-avatars
app.use(
  "/default-avatars",
  express.static(path.join(__dirnameLocal, "public", "default-avatars"))
);

// -------------------------
// API Routes
// -------------------------
app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/rooms", roomRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

export default app;
