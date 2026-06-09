import { Router, type Response } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt.js";
import { authenticate } from "../middlewares/auth.js";
import { validateBody } from "../middlewares/validate.js";
import { Errors, AppError } from "../lib/errors.js";
import { EmailService } from "../services/EmailService.js";

const router = Router();

const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 15 * 60 * 1000, // 15 mins
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 1000, // 30 days
  });
};

const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
};

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: { code: "RATE_LIMITED", message: "Too many auth attempts" } },
});

// ── Schemas ───────────────────────────────────────────────────────────────────

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const RegisterSchema = z.object({
  tenantName: z.string().min(2).max(100),
  tenantDomain: z.string().min(2).max(255),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

const RefreshSchema = z.object({
  refreshToken: z.string().min(1),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post("/login", authLimiter, validateBody(LoginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body as z.infer<typeof LoginSchema>;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true, tenant: true },
    });

    if (!user || user.deletedAt) throw Errors.unauthorized("Invalid credentials");
    if (user.status !== "ACTIVE") throw Errors.unauthorized("Account is not active");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw Errors.unauthorized("Invalid credentials");

    if (!user.emailVerified) {
      throw new AppError("Email not verified", 403, "EMAIL_NOT_VERIFIED");
    }

    const payload = {
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role.name,
    };

    const accessToken = signAccessToken(payload);
    const rawRefresh = signRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: rawRefresh,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    setAuthCookies(res, accessToken, rawRefresh);

    res.json({
      accessToken,
      refreshToken: rawRefresh,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role.name,
        tenantId: user.tenantId,
        tenantName: user.tenant.name,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/refresh ────────────────────────────────────────────────────
router.post("/refresh", validateBody(RefreshSchema), async (req, res, next) => {
  try {
    let refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      refreshToken = (req.body as z.infer<typeof RefreshSchema>).refreshToken;
    }
    
    if (!refreshToken) {
      throw Errors.unauthorized("No refresh token provided");
    }

    const decoded = verifyRefreshToken(refreshToken);

    const stored = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      throw Errors.unauthorized("Refresh token is invalid or expired");
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { role: true },
    });

    if (!user || user.deletedAt || user.status !== "ACTIVE") {
      throw Errors.unauthorized("User account unavailable");
    }

    // Rotate refresh token
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    const newRefresh = signRefreshToken(user.id);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: newRefresh,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    const accessToken = signAccessToken({
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      role: user.role.name,
    });

    setAuthCookies(res, accessToken, newRefresh);

    res.json({ accessToken, refreshToken: newRefresh });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
router.post("/logout", authenticate, async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
    if (refreshToken) {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken, userId: req.user!.userId },
        data: { revokedAt: new Date() },
      });
    }
    clearAuthCookies(res);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: {
        role: true,
        tenant: { select: { id: true, name: true, logoUrl: true } },
        clinicAssignments: {
          where: { deletedAt: null },
          include: { clinic: { select: { id: true, name: true } } },
        },
      },
    });

    if (!user || user.deletedAt) throw Errors.notFound("User");

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      mobile: user.mobile,
      avatarUrl: user.avatarUrl,
      role: user.role.name,
      tenantId: user.tenantId,
      tenantName: user.tenant.name,
      status: user.status,
      tenant: user.tenant,
      clinics: user.clinicAssignments.map((a) => a.clinic),
      lastLoginAt: user.lastLoginAt,
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/register (bootstrap first super-admin + tenant) ────────────
router.post("/register", authLimiter, validateBody(RegisterSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof RegisterSchema>;

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw Errors.conflict("Email already in use");

    let tenantAdminRole = await prisma.role.findFirst({
      where: { name: "CLINIC_ADMIN", isSystem: true },
    });

    if (!tenantAdminRole) {
      tenantAdminRole = await prisma.role.create({
        data: {
          name: "CLINIC_ADMIN",
          description: "Tenant default administrator",
          isSystem: true,
        },
      });
    }

    const hashed = await bcrypt.hash(data.password, 12);

    const tenant = await prisma.tenant.create({
      data: { name: data.tenantName, domain: data.tenantDomain },
    });

    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        roleId: tenantAdminRole.id,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashed,
        emailVerified: false,
        verificationToken: crypto.randomUUID(),
        status: "ACTIVE",
      },
    });

    // Send the verification email using the new EmailService
    await EmailService.sendVerificationEmail(user.email, user.verificationToken!);

    res.status(201).json({
      message: "Registration successful. Please verify your email.",
      user: {
        id: user.id,
        email: user.email,
        firstName: data.firstName,
        lastName: data.lastName,
        role: "CLINIC_ADMIN",
        tenantId: tenant.id,
        tenantName: data.tenantName,
        avatarUrl: null,
      },
    });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/auth/verify-email ────────────────────────────────────────────────
router.get("/verify-email", async (req, res, next) => {
  try {
    const { token } = req.query;
    if (typeof token !== "string" || !token) {
      throw Errors.validation("Token is required");
    }

    const user = await prisma.user.findFirst({
      where: { verificationToken: token, deletedAt: null },
    });

    if (!user) {
      throw Errors.unauthorized("Invalid or expired verification token");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
      },
    });

    res.redirect("/login?verified=true");
  } catch (err) {
    next(err);
  }
});

const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

const ResetPasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

// ── POST /api/auth/forgot-password ───────────────────────────────────────────
router.post("/forgot-password", authLimiter, validateBody(ForgotPasswordSchema), async (req, res, next) => {
  try {
    const { email } = req.body as z.infer<typeof ForgotPasswordSchema>;

    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond 200 to prevent email enumeration
    if (user && !user.deletedAt) {
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      const hashed = await bcrypt.hash(token, 10);

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: hashed, resetTokenExpiresAt: expiresAt },
      });

      // In production, send via email. In dev, log to console.
      console.log(`[RESET TOKEN] Email: ${email} | Token: ${token} | Expires: ${expiresAt.toISOString()}`);
    }

    res.json({ ok: true, message: "If that email is registered, a reset link has been sent." });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/auth/reset-password ─────────────────────────────────────────────
router.post("/reset-password", authLimiter, validateBody(ResetPasswordSchema), async (req, res, next) => {
  try {
    const { token, newPassword } = req.body as z.infer<typeof ResetPasswordSchema>;

    // Find users with a non-expired reset token
    const users = await prisma.user.findMany({
      where: {
        resetToken: { not: null },
        resetTokenExpiresAt: { gt: new Date() },
      },
    });

    let matchedUser = null;
    for (const u of users) {
      const isMatch = await bcrypt.compare(token, u.resetToken!);
      if (isMatch) { matchedUser = u; break; }
    }

    if (!matchedUser) throw Errors.unauthorized("Invalid or expired reset token");

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: matchedUser.id },
      data: { password: hashed, resetToken: null, resetTokenExpiresAt: null },
    });

    res.json({ ok: true, message: "Password reset successfully. Please log in." });
  } catch (err) {
    next(err);
  }
});

export default router;

