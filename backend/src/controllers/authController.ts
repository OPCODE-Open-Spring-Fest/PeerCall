import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import { generateToken } from "../utils/generateToken.js";
import { validateEmail, validatePassword } from "../utils/validateInputs.js";

export const registerUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ success: false, message: "All fields are required" });

        if (!validateEmail(email))
            return res.status(400).json({ success: false, message: "Invalid email format" });

        if (!validatePassword(password))
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

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
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ success: false, message: "Email and password required" });

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
