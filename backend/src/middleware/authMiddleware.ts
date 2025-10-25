import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
    userId?: string;
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
    let token = req.headers.authorization?.split(" ")[1];

    if (!token)
        return res
            .status(401)
            .json({ success: false, message: "Not authorized, token missing" });

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_ACCESS_SECRET as string // <-- UPDATED ENV VARIABLE
        ) as { id: string };
        req.userId = decoded.id;
        next();
    } catch {
        // Note: This will now correctly trigger a 401 on an expired access token
        res.status(401).json({ success: false, message: "Invalid token" });
    }
};