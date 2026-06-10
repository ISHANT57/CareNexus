import { type Request, type Response, type NextFunction } from "express";
import crypto from "crypto";
import { Errors } from "../lib/errors.js";

export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // 1. Generate CSRF token if not present in cookies
  let token = req.cookies ? req.cookies["XSRF-TOKEN"] : undefined;
  if (!token) {
    token = crypto.randomBytes(24).toString("hex");
    res.cookie("XSRF-TOKEN", token, {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false, // Must be accessible by client JS
    });
  }

  // 2. Enforce check on state-changing methods
  const stateChangingMethods = ["POST", "PUT", "PATCH", "DELETE"];
  if (stateChangingMethods.includes(req.method)) {
    const headerToken = req.headers["x-xsrf-token"] as string | undefined;
    if (!token || !headerToken || token !== headerToken) {
      return next(Errors.forbidden("Invalid or missing CSRF token"));
    }
  }

  next();
}
