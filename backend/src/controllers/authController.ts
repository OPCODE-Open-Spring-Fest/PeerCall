import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import User, { type IUser } from "../models/userModel.js";
import { generateToken } from "../utils/generateToken.js";
import { userSchema, loginSchema } from "../utils/validateInputs.js";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { Session } from "../models/sessionModel.js";

dotenv.config();
const asTypedUser = (user: any): IUser & { _id: string } => user as IUser & { _id: string };

// ✅ SIGNUP CONTROLLER
export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = userSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: parseResult.error.issues[0]?.message,
      });
    }

    const { email, password } = parseResult.data;

    // ✅ Auto-derive name from email
    const name = email.split("@")[0];

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword });
    const typedUser = asTypedUser(newUser);

    const token = generateToken(typedUser._id.toString());
const decoded = jwt.decode(token) as { exp?: number } | null;

if (!decoded || !decoded.exp) {
  throw new Error("Invalid token format or missing expiration");
}

const expiresAt = new Date(decoded.exp * 1000);
await Session.create({
  userId: typedUser._id,
  token,
  expiresAt,
});

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ LOGIN CONTROLLER (same as before)
export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
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
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    if (!foundUser.password || foundUser.password === "") {
      return res.status(400).json({
        success: false,
        message: "This account was registered via SSO. Please sign in with Google or GitHub.",
      });
    }

    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    const typedUser = asTypedUser(foundUser);

      const token = generateToken(typedUser._id.toString());
const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { exp?: number };

if (!decoded.exp) {
  throw new Error("Token missing expiration claim");
}

const expiresAt = new Date(decoded.exp * 1000);

await Session.create({
  userId: typedUser._id,
  token,
  expiresAt,
});


    res.json({
      success: true,
      message: "Login successful",
      token,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ GET PROFILE CONTROLLER (unchanged)
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.userId).select("-password");

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
