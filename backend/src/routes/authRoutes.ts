import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  logoutUser,
  handleRefreshToken,
} from "../controllers/authController.js";
import passport from "passport";
import { Session } from "../models/sessionModel.js";
import { protect } from "../middleware/authMiddleware.js";
import { generateToken, generateRefreshToken } from "../utils/generateToken.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User, { type IUser } from "../models/userModel.js";

dotenv.config();

const router = express.Router();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// REST endpoints
router.post("/signup", registerUser);
router.post("/signin", loginUser);
router.post("/logout", logoutUser);
router.get("/refresh", handleRefreshToken);
router.get("/me", protect, getUserProfile);

// OAuth - Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${FRONTEND_URL}/signin` }),
  async (req, res) => {
    try {
      const user = req.user as (IUser & { _id: string }) | undefined;
      if (!user) {
        return res.redirect(`${FRONTEND_URL}/signin`);
      }

      const accessToken = generateToken(user._id.toString());
      const refreshToken = generateRefreshToken(user._id.toString());

      user.refreshTokens = [refreshToken];
      await user.save();

      // Create session for access token
      const decoded = jwt.decode(accessToken) as { exp?: number } | null;
      const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 15 * 60 * 1000);
      await Session.create({
        userId: user._id,
        token: accessToken,
        expiresAt,
      });

      // Set refresh cookie
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // Redirect to success page on frontend
      return res.redirect(`${FRONTEND_URL}/oauth-success`);
    } catch (err) {
      console.error("Google callback error:", err);
      return res.redirect(`${FRONTEND_URL}/signin`);
    }
  }
);

// OAuth - GitHub
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"], session: false })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: `${FRONTEND_URL}/signin` }),
  async (req, res) => {
    try {
      const user = req.user as (IUser & { _id: string }) | undefined;
      if (!user) {
        return res.redirect(`${FRONTEND_URL}/signin`);
      }
      const accessToken = generateToken(user._id.toString());
      const refreshToken = generateRefreshToken(user._id.toString());

      user.refreshTokens = [refreshToken];
      await user.save();

      // Create session for access token
      const decoded = jwt.decode(accessToken) as { exp?: number } | null;
      const expiresAt = decoded?.exp ? new Date(decoded.exp * 1000) : new Date(Date.now() + 15 * 60 * 1000);
      await Session.create({
        userId: user._id,
        token: accessToken,
        expiresAt,
      });

      // Set refresh cookie
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.redirect(`${FRONTEND_URL}/oauth-success`);
    } catch (err) {
      console.error("GitHub callback error:", err);
      return res.redirect(`${FRONTEND_URL}/signin`);
    }
  }
);

export default router;