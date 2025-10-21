import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const protect = (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization?.split(" ")[1];

    if (!token)
        return res.status(401).json({ success: false, message: "Not authorized, token missing" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
        (req as any).userId = decoded.id;
        next();
    } catch {
        res.status(401).json({ success: false, message: "Invalid token" });
    }
};
