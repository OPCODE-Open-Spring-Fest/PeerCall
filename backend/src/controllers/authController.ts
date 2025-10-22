import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import { generateToken } from "../utils/generateToken.js";
import { userSchema, loginSchema } from "../utils/validateInputs.js";

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = userSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({ success: false, message: parseResult.error.issues[0]?.message });
    }

    const { name, email, password } = parseResult.data;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ success: false, message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: generateToken(user._id.toString()),
    });
  } catch (err) {
    next(err);
  }
};

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({ success: false, message: parseResult.error.issues[0]?.message || "Validation error" });
    }

    const { email, password } = parseResult.data;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: "Invalid credentials" });

    res.json({
      success: true,
      message: "Login successful",
      token: generateToken(user._id.toString()),
    });
  } catch (err) {
    next(err);
  }
};
