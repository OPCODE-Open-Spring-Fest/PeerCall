import cron from "node-cron";
import { cleanupExpiredSessions } from "./sessionCleanup.js";
import logger from "./logger.js";

export const initializeScheduler = () => {
  const sessionCleanupCron = process.env.SESSION_CLEANUP_CRON || "0 * * * *";
  const sessionCleanupJob = cron.schedule(sessionCleanupCron, async () => {
    try {
      logger.info("🔄 Running scheduled session cleanup...");
      const result = await cleanupExpiredSessions();
      logger.info(`✅ Session cleanup completed: ${result.deletedCount} expired session(s) removed`);
    } catch (error: any) {
      logger.error("Scheduled session cleanup failed:", error);
    }
  }, {
    timezone: "UTC",
  });
  cleanupExpiredSessions()
    .then((result) => {
      logger.info(`✅ Initial session cleanup completed on startup: ${result.deletedCount} expired session(s) removed`);
    })
    .catch((error) => {
      logger.error(" Initial session cleanup failed:", error);
    });

  logger.info("📅 Scheduled tasks initialized:");
  logger.info(`   - Session cleanup: Cron schedule "${sessionCleanupCron}" (every hour by default)`);

  return {
    sessionCleanupJob,
  };
};

