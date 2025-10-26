import express from "express";
import { registerUser, loginUser,  getUserProfile} from "../controllers/authController.js";
import passport from "passport";
import { Session } from "../models/sessionModel.js";
import {protect} from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/signin", loginUser);
router.get("/me", protect, getUserProfile);

router.post("/logout", protect, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
      return res.status(400).json({ success: false, message: "Token missing" });

    // Delete session for this token
    const result = await Session.deleteOne({ token });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Session not found or already logged out" });
    }

    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.error("❌ Logout error:", error);
    res.status(500).json({ success: false, message: "Server error during logout" });
  }
});

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/signin` : "/signin" }),
 
);

// GitHub OAuth
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"], session: false })
);
router.get(
  "/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/signin` : "/signin" }),
  
);

export default router;