import jwt from "jsonwebtoken";
import type { SignOptions, Secret } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const accessTokenSecret = process.env.JWT_ACCESS_SECRET as Secret;
const refreshTokenSecret = process.env.JWT_REFRESH_SECRET as Secret;

function parseExpiration(value: string | undefined, fallback: string): any {
  return value && value.trim().length > 0 ? value : fallback;
}

export const generateToken = (userId: string) => {
  if (!accessTokenSecret) throw new Error("JWT_ACCESS_SECRET is not defined");

  const options: SignOptions = {
    expiresIn: parseExpiration(process.env.JWT_ACCESS_EXPIRES, "15m") as any,
  };

  return jwt.sign({ id: userId }, accessTokenSecret, options);
};

export const generateRefreshToken = (userId: string) => {
  if (!refreshTokenSecret) throw new Error("JWT_REFRESH_SECRET is not defined");

  const options: SignOptions = {
    expiresIn: parseExpiration(process.env.JWT_REFRESH_EXPIRES, "7d") as any,
  };

  return jwt.sign({ id: userId }, refreshTokenSecret, options);
};
