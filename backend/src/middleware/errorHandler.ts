import type { Request, Response, NextFunction } from "express";

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error("❌ Error:", err.message);
    res.status(500).json({ success: false, message: err.message || "Server Error" });
};
