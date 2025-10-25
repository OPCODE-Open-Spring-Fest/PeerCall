import jwt from "jsonwebtoken"
import type { SignOptions } from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();
const accessTokenSecret = process.env.JWT_ACCESS_SECRET;

const refreshTokenSecret = process.env.JWT_REFRESH_SECRET;

const parseExpiration = (val: string | undefined, fallback: number | string): number | string => {
    if (!val) return fallback;
    const trimmed = val.trim();
    return /^\d+$/.test(trimmed) ? Number(trimmed) : trimmed;
};

export const generateAccessToken = (id: string) => {
    // console.log(accessTokenSecret)
    if (!accessTokenSecret) throw new Error("JWT_ACCESS_SECRET is not defined");

    const options = {
        expiresIn: parseExpiration(process.env.JWT_ACCESS_EXPIRATION, 900),
    } as SignOptions;

    return jwt.sign({ id }, accessTokenSecret, options);
};

export const generateRefreshToken = (id: string) => {
    if (!refreshTokenSecret) throw new Error("JWT_REFRESH_SECRET is not defined");

    const options = {
        expiresIn: parseExpiration(process.env.JWT_REFRESH_EXPIRATION, "7d"),
    } as SignOptions;

    return jwt.sign({ id }, refreshTokenSecret, options);
};