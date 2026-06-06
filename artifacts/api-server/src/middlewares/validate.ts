import { type Request, type Response, type NextFunction } from "express";
import { type ZodSchema, ZodError } from "zod";
import { AppError } from "../lib/errors.js";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      }));
      const err = new AppError(
        "Validation failed",
        422,
        "VALIDATION_ERROR",
      ) as AppError & { details: typeof details };
      (err as unknown as { details: typeof details }).details = details;
      return next(err);
    }
    req.body = result.data;
    next();
  };
}

export function validateQuery<T>(schema: ZodSchema<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      const details = result.error.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      }));
      const err = new AppError("Query validation failed", 422, "VALIDATION_ERROR") as AppError & { details: typeof details };
      (err as unknown as { details: typeof details }).details = details;
      return next(err);
    }
    (req as Request & { validatedQuery: T }).validatedQuery = result.data;
    next();
  };
}
