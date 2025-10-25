import express from "express";
import { registerUser, loginUser,  getUserProfile } from "../controllers/authController.js";
import passport from "passport";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/signin", loginUser);
router.get("/me", protect, getUserProfile);

// Google OAuth
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"], session: false })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/signin` : "/signin" }),
  oauthCallback
);

// GitHub OAuth
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"], session: false })
);
router.get(
  "/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/signin` : "/signin" }),
  oauthCallback
);

export default router;