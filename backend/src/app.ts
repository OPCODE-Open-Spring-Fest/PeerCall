import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import roomRoutes from "./routes/roomRoutes.js";
import passport from "passport";
import "./utils/passport.js"
import cors from "cors";
dotenv.config();
const app = express();

app.use(express.json());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
//initialize passport
app.use(passport.initialize());
// Routes
app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/rooms", roomRoutes);

// Error Handler
app.use(errorHandler);

export default app;
