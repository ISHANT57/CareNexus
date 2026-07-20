import { type Request, type Response, type NextFunction } from "express";
import { verifyAccessToken } from "../lib/jwt.js";
import { Errors } from "../lib/errors.js";

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    let token = req.cookies?.accessToken;
    if (!token) {
      const header = req.headers["authorization"];
      if (header?.startsWith("Bearer ")) {
        token = header.slice(7);
      }
    }
    if (!token) throw Errors.unauthorized();

    const payload = verifyAccessToken(token);

    req.user = payload;
    next();
  } catch (err) {
    if ((err as Error).name === "AppError") return next(err);
    next(Errors.unauthorized("Invalid or expired token"));
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    let token = req.cookies?.accessToken;
    if (!token) {
      const header = req.headers["authorization"];
      if (header?.startsWith("Bearer ")) {
        token = header.slice(7);
      }
    }
    if (token) {
      const payload = verifyAccessToken(token);
      req.user = payload;
    }
  } catch {
    // Swallow auth errors for optional auth
  }
  next();
}
