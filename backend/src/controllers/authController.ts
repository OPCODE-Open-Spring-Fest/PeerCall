import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import User, { type IUser } from "../models/userModel.js"; 
import { generateToken } from "../utils/generateToken.js";
import { userSchema, loginSchema } from "../utils/validateInputs.js";
import dotenv from "dotenv";

dotenv.config();
const asTypedUser = (user: any): IUser & { _id: string } => user as IUser & { _id: string };

//signup controller
export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = userSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: parseResult.error.issues[0]?.message,
      });
    }

    const { name, email, password } = parseResult.data;
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ success: false, message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ name, email, password: hashedPassword });
    const typedUser = asTypedUser(newUser);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      token: generateToken(typedUser._id.toString()),
    });
  } catch (err) {
    next(err);
  }
};

//sign in controller
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

    res.json({
      success: true,
      message: "Login successful",
      token: generateToken(typedUser._id.toString()),
    });
  } catch (err) {
    next(err);
  }
};

//OAuth callback handler
export const oauthCallback = (req: Request & { user?: any }, res: Response) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const user = req.user as IUser & { _id: string } | undefined;

    if (!user) {
      return res.redirect(`${frontendUrl}/signin?error=oauth_failed`);
    }

    const token = generateToken(user._id.toString());
    const redirectUrl = `${frontendUrl}/oauth-success#token=${token}`;

    return res.redirect(redirectUrl);
  } catch (err) {
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    return res.redirect(`${frontendUrl}/signin?error=server_error`);
  }
};
