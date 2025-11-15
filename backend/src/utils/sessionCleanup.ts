import { Session } from "../models/sessionModel.js";
import logger from "./logger.js";
export const cleanupExpiredSessions = async (): Promise<{ deletedCount: number }> => {
  try {
    const now = new Date();
    const result = await Session.deleteMany({
      expiresAt: { $lt: now },
    });
    if (result.deletedCount > 0) {
      logger.info(`🧹 Cleaned up ${result.deletedCount} expired session(s)`);
    }
    return { deletedCount: result.deletedCount || 0 };
  } catch (error: any) {
    logger.error(" Error cleaning up expired sessions:", error);
    throw error;
  }
};
