import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import { logger } from "./lib/logger.js";
import router from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";

const app: Express = express();
logger.info(`NODE_ENV is: ${process.env.NODE_ENV}`);

// ── Trust proxy (needed behind Render/load balancer) ─────────────────────────
app.set("trust proxy", 1);

// ── Request logging ───────────────────────────────────────────────────────────
app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return { id: req.id, method: req.method, url: req.url?.split("?")[0] };
      },
      res(res) {
        return { statusCode: res.statusCode };
      },
    },
  }),
);

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env["CORS_ORIGIN"] ?? "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  }),
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

import { csrfProtection } from "./middlewares/csrf.js";
app.use(csrfProtection);

// ── Global rate limiting ──────────────────────────────────────────────────────
// Skip in development to avoid 429 errors during hot-reload / rapid testing
if (process.env.NODE_ENV === "production") {
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 300,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: { code: "RATE_LIMITED", message: "Too many requests" } },
    }),
  );
}

// ── Static file serving for local uploads ─────────────────────────────────────
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.resolve(__dirname, "../../../uploads");
import fsSync from "fs";
if (!fsSync.existsSync(uploadsDir)) fsSync.mkdirSync(uploadsDir, { recursive: true });
app.use("/uploads", express.static(uploadsDir));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api", router);

// ── Error handler (must be last) ──────────────────────────────────────────────
app.use(errorHandler);

export default app;
