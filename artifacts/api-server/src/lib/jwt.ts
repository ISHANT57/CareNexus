import jwt from "jsonwebtoken";
import { type JwtPayload } from "../types/index.js";

const ACCESS_SECRET = process.env["JWT_SECRET"] ?? "changeme-set-jwt-secret";
const REFRESH_SECRET =
  process.env["JWT_REFRESH_SECRET"] ?? "changeme-set-jwt-refresh-secret";

const ACCESS_EXPIRES = "8h";
const REFRESH_EXPIRES = "30d";

export function signAccessToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): { userId: string } {
  return jwt.verify(token, REFRESH_SECRET) as { userId: string };
}
