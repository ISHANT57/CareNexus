import { describe, it, expect, vi, beforeEach } from "vitest";
import { authorizePermission } from "../rbac.js";
import { prisma } from "../../lib/prisma.js";

// Mock the prisma client
vi.mock("../../lib/prisma.js", () => ({
  prisma: {
    role: {
      findFirst: vi.fn(),
    },
  },
}));

describe("RBAC Middleware: authorizePermission", () => {
  let mockReq: any;
  let mockRes: any;
  let nextFunction: any;

  beforeEach(() => {
    mockReq = {
      user: { role: "DOCTOR" },
      tenantId: "tenant-1",
    };
    mockRes = {};
    nextFunction = vi.fn();
    vi.clearAllMocks();
  });

  it("should block unauthenticated users", async () => {
    mockReq.user = null;
    const middleware = authorizePermission("patients", "read");
    await middleware(mockReq, mockRes, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    const err = nextFunction.mock.calls[0][0];
    expect(err).toBeDefined();
    expect(err.statusCode).toBe(401);
  });

  it("should allow SUPER_ADMIN to bypass permissions", async () => {
    mockReq.user = { role: "SUPER_ADMIN" };
    const middleware = authorizePermission("anything", "write");
    await middleware(mockReq, mockRes, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(); // Called without error
  });

  it("should allow via system role fallback if no custom permissions in DB", async () => {
    (prisma.role.findFirst as any).mockResolvedValue(null);

    const middleware = authorizePermission("patients", "read");
    await middleware(mockReq, mockRes, nextFunction);

    expect(nextFunction).toHaveBeenCalledWith(); // Called without error
  });

  it("should block via system role fallback if action not allowed", async () => {
    (prisma.role.findFirst as any).mockResolvedValue(null);

    const middleware = authorizePermission("users", "write");
    await middleware(mockReq, mockRes, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    const err = nextFunction.mock.calls[0][0];
    expect(err).toBeDefined();
    expect(err.statusCode).toBe(403);
  });
});
