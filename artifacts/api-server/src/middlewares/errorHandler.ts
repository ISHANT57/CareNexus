import { type Request, type Response, type NextFunction } from "express";
import { AppError } from "../lib/errors.js";
import { logger } from "../lib/logger.js";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    const body: Record<string, unknown> = {
      error: {
        code: err.code,
        message: err.message,
      },
    };
    const details = (err as AppError & { details?: unknown }).details;
    if (details) {
      (body["error"] as Record<string, unknown>)["details"] = details;
    }
    res.status(err.statusCode).json(body);
    return;
  }

  // Prisma known errors
  if (err.name === "PrismaClientKnownRequestError") {
    const prismaErr = err as Error & { code?: string };
    if (prismaErr.code === "P2002") {
      res.status(409).json({
        error: { code: "CONFLICT", message: "A record with this value already exists" },
      });
      return;
    }
    if (prismaErr.code === "P2025") {
      res.status(404).json({
        error: { code: "NOT_FOUND", message: "Record not found" },
      });
      return;
    }
  }

  logger.error(
    { err, method: req.method, url: req.url },
    "Unhandled error",
  );

  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message:
        process.env["NODE_ENV"] === "production"
          ? "An unexpected error occurred"
          : err.message,
    },
  });
}
