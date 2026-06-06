import { type Request } from "express";
export { AppError, Errors } from "../lib/errors.js";

export interface JwtPayload {
  userId: string;
  tenantId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      tenantId?: string;
    }
  }
}

export type Role =
  | "SUPER_ADMIN"
  | "AREA_ADMIN"
  | "CLINIC_ADMIN"
  | "DOCTOR"
  | "OPERATOR"
  | "STAFF";

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export function paginate(query: PaginationQuery): {
  skip: number;
  take: number;
  page: number;
  limit: number;
} {
  const page = Math.max(1, parseInt(query.page ?? "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit ?? "20", 10)));
  return { skip: (page - 1) * limit, take: limit, page, limit };
}

export function paginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  return { total, page, limit, pages: Math.ceil(total / limit) };
}

export function ok<T>(data: T, meta?: PaginationMeta) {
  return meta ? { data, meta } : { data };
}
