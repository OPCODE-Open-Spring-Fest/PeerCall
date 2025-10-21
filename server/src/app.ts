import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

dotenv.config();
const app = express();

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

// Error Handler
app.use(errorHandler);

export default app;
