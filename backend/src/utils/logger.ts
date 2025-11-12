import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";
import { existsSync, mkdirSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logsDir = path.join(process.cwd(), "logs");
if (!existsSync(logsDir)) {
  mkdirSync(logsDir, { recursive: true });
}

//log levels
const levels = {error: 0,warn: 1,info: 2,http: 3,debug: 4,};
//log colors
const colors = { error: "red", warn: "yellow", info: "green", http: "magenta", debug: "white",};
winston.addColors(colors);

//log format
const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
      )
    ),
  }),
  new winston.transports.File({
    filename: path.join(logsDir, "error.log"),
    level: "error",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
  new winston.transports.File({
    filename: path.join(logsDir, "combined.log"),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
  }),
];

//logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  levels,
  format,
  transports,
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "exceptions.log"),
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "rejections.log"),
    }),
  ],
});
if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}
export default logger;

