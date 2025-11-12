import type { Request, Response, NextFunction } from "express";
import logger from "../utils/logger.js";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  //log request
  logger.http(`${req.method} ${req.originalUrl} - ${req.ip}`);
  //response
  res.on("finish", () => {
    const duration = Date.now() - start;
    const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms - ${req.ip}`;
    if (res.statusCode >= 400) {
      logger.warn(logMessage);
    } else {
      logger.http(logMessage);
    }
  });
  next();
};
