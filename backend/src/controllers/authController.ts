import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken"; // <-- ADDED
import User, { type IUser } from "../models/userModel.js";
import {
  generateAccessToken, // <-- RENAMED/UPDATED
  generateRefreshToken, // <-- ADDED
} from "../utils/generateToken.js";
import { userSchema, loginSchema } from "../utils/validateInputs.js";
import dotenv from "dotenv";

dotenv.config();
const asTypedUser = (user: any): IUser & { _id: string } =>
  user as IUser & { _id: string };

// A helper function to send tokens
const sendTokens = (res: Response, user: IUser & { _id: string }) => {
  const accessToken = generateAccessToken(user._id.toString());
  const newRefreshToken = generateRefreshToken(user._id.toString());

  // Update user's refresh tokens in DB
  // Only one refresh token per user is supported (single device).
  user.refreshTokens = [newRefreshToken];

  // Set refresh token in secure httpOnly cookie
  res.cookie("jwt", newRefreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matches token expiry)
  });

  // Send access token in response body
  res.json({
    success: true,
    message: "Login successful",
    accessToken: accessToken,
  });
};

// ✅ SIGNUP CONTROLLER (Updated)
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parseResult = userSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: parseResult.error.issues[0]?.message,
      });
    }

    const { email, password } = parseResult.data;
    const name = email.split("@")[0];

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword });
    const typedUser = asTypedUser(newUser);

    // Generate and send tokens
    sendTokens(res, typedUser);
  } catch (err) {
    next(err);
  }
};

// ✅ LOGIN CONTROLLER (Updated)
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: parseResult.error.issues[0]?.message || "Validation error",
      });
    }

    const { email, password } = parseResult.data;
    const foundUser = await User.findOne({ email });
    if (!foundUser)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    if (!foundUser.password || foundUser.password === "") {
      return res.status(400).json({
        success: false,
        message:
          "This account was registered via SSO. Please sign in with Google or GitHub.",
      });
    }

    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch)
      return res
        .status(400)
        .json({ success: false, message: "Invalid credentials" });

    const typedUser = asTypedUser(foundUser);

    // Generate and send tokens
    await typedUser.save(); // Save any potential changes (like refresh tokens)
    sendTokens(res, typedUser);
  } catch (err) {
    next(err);
  }
};

// ✅ OAUTH CALLBACK CONTROLLER (New)
export const oauthCallback = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication failed" });
    }

    const typedUser = asTypedUser(req.user);

    // We get the user profile from passport's `done` function
    // (which you'd have in src/utils/passport.ts)
    // Now we just generate and send tokens

    // Find the user in DB (req.user is from passport)
    const foundUser = await User.findById(typedUser._id);
    if (!foundUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const typedFoundUser = asTypedUser(foundUser);
    await typedFoundUser.save();

    // We send tokens the same way, but redirect the user
    const accessToken = generateAccessToken(typedFoundUser._id.toString());
    const newRefreshToken = generateRefreshToken(typedFoundUser._id.toString());

    typedFoundUser.refreshTokens = [newRefreshToken];
    await typedFoundUser.save();

    res.cookie("jwt", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Set the access token in a secure, HTTP-only cookie
    res.cookie("access_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 minutes, adjust as needed
    });

    // Redirect to the frontend without passing the token in the URL
    const redirectUrl = `${process.env.FRONTEND_URL}/auth-success`;
    res.redirect(redirectUrl);

  } catch (err) {
    next(err);
  }
};

// ... (keep all other functions as they are)

// ✅ REFRESH TOKEN CONTROLLER (Updated with fixes)
export const handleRefreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized, no token" });
    }

    const refreshToken = cookies.jwt;
    // Clear the old cookie immediately
    res.clearCookie("jwt", { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV !== "development" });

    const foundUser = await User.findOne({ refreshTokens: refreshToken });

    // Detected refresh token reuse!
    if (!foundUser) {
      try {
        const decoded = jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET as string
        ) as { id: string };

        // We know who the user is, now we hack-proof them
        // by deleting all their refresh tokens
        const compromisedUser = await User.findById(decoded.id);
        if (compromisedUser) {
          compromisedUser.refreshTokens = [];
          await compromisedUser.save();
        }
      } catch (err) {
        // Token was invalid in the first place
      } finally {
        return res
          .status(403)
          .json({ success: false, message: "Forbidden, token reuse" });
      }
    }

    // Valid token, let's rotate it
    const typedUser = asTypedUser(foundUser);

    try {
      // Verify the token is still valid
      jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as {
        id: string;
      };

      // Generate new tokens
      const newAccessToken = generateAccessToken(typedUser._id.toString());
      const newRefreshToken = generateRefreshToken(typedUser._id.toString());

      // ==================
      //      FIX #1
      // ==================
      // Filter out the old token and default to an empty array
      const otherRefreshTokens =
        typedUser.refreshTokens?.filter((rt) => rt !== refreshToken) || [];

      // Assign the new array (filtered list + new token)
      typedUser.refreshTokens = [...otherRefreshTokens, newRefreshToken];
      await typedUser.save();

      // Send new tokens
      res.cookie("jwt", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== "development",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        accessToken: newAccessToken,
      });
    } catch (err) {
      // Token expired or invalid
      // ==================
      //      FIX #2
      // ==================
      // Clear out the bad token, default to an empty array
      typedUser.refreshTokens =
        typedUser.refreshTokens?.filter((rt) => rt !== refreshToken) || [];
      await typedUser.save();

      return res
        .status(403)
        .json({ success: false, message: "Forbidden, token invalid or expired" });
    }
  } catch (err) {
    next(err);
  }
};


// ✅ LOGOUT CONTROLLER (Updated with fix)
export const logoutUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) {
      return res.status(204).json({ success: true, message: "No content" }); // No cookie, already logged out
    }

    const refreshToken = cookies.jwt;

    // Find user and remove this specific refresh token
    const foundUser = await User.findOne({ refreshTokens: refreshToken });
    if (foundUser) {
      foundUser.refreshTokens =
        foundUser.refreshTokens?.filter((rt) => rt !== refreshToken) || [];

      await foundUser.save();
    }

    // Clear the cookie
    res.clearCookie("jwt", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV !== "development",
    });

    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    next(err);
  }
};

// ✅ GET PROFILE CONTROLLER (Unchanged, but for completeness)
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    // req.userId comes from the 'protect' middleware
    // @ts-ignore
    const user = await User.findById(req.userId).select("-password -refreshTokens");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};