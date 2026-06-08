export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const Errors = {
  unauthorized: (msg = "Authentication required") =>
    new AppError(msg, 401, "UNAUTHORIZED"),
  forbidden: (msg = "Insufficient permissions") =>
    new AppError(msg, 403, "FORBIDDEN"),
  notFound: (resource = "Resource") =>
    new AppError(`${resource} not found`, 404, "NOT_FOUND"),
  conflict: (msg: string) => new AppError(msg, 409, "CONFLICT"),
  badRequest: (msg: string) => new AppError(msg, 400, "BAD_REQUEST"),
  validation: (msg: string) => new AppError(msg, 422, "VALIDATION_ERROR"),
  tenantMismatch: () =>
    new AppError("Cross-tenant access denied", 403, "TENANT_MISMATCH"),
  internal: (msg = "Internal server error") =>
    new AppError(msg, 500, "INTERNAL_ERROR"),
};
