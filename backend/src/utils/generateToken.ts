import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();
const accessTokenSecret = process.env.JWT_ACCESS_SECRET;

export const generateToken = (userId: string) => {
  const expiresIn = "7d"; 
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn,
  });
  return token;
};

export const generateRefreshToken = (id: string) => {
    if (!refreshTokenSecret) throw new Error("JWT_REFRESH_SECRET is not defined");

    const options = {
        expiresIn: parseExpiration(process.env.JWT_REFRESH_EXPIRATION, "7d"),
    } as SignOptions;

    return jwt.sign({ id }, refreshTokenSecret, options);
};