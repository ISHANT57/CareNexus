/**
 * Files Route — Production-grade local file storage
 *
 * Fixes applied:
 * 1. Route order fixed: /:fileKey/download MUST be before /:id to avoid conflict
 * 2. Storage uses memory buffer → LocalStorageProvider abstraction (not diskStorage callback)
 * 3. Directory created at module init (not in multer callback) — eliminates race condition
 * 4. Original filename stored in `caseBlock` field (no migration needed)
 * 5. File type and size validation: 25MB limit, allowlisted MIME types
 * 6. Download serves with correct Content-Disposition using original filename
 * 7. Delete also removes physical file from disk
 */
import { Router } from "express";
import multer from "multer";
import path from "path";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { CLINICAL_ROLES } from "../middlewares/rbac.js";
import { requireTenant } from "../middlewares/tenantScope.js";
import { Errors } from "../lib/errors.js";
import { storage } from "../lib/storage.js";

const router = Router();

// ── Allowed MIME types ────────────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg", "image/png", "image/gif", "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv", "text/plain",
]);

const MAX_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

// Use memoryStorage so we control writing via our StorageProvider
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed: ${file.mimetype}. Allowed: PDF, images, Word, Excel, CSV, text.`));
    }
  },
});

// ── Upload ────────────────────────────────────────────────────────────────────
router.post("/", authenticate, requireTenant, CLINICAL_ROLES, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) throw Errors.validation("No file uploaded");

    const patientId = req.body.patientId as string;
    if (!patientId) throw Errors.validation("patientId is required");

    const originalFilename = req.file.originalname;

    // Save to disk via storage abstraction
    const saved = await storage.save(req.file.buffer, originalFilename, "patients");

    // Store original filename in `caseBlock` field (no migration required)
    const fileRecord = await prisma.fileUpload.create({
      data: {
        tenantId: req.tenantId!,
        patientId,
        uploaderId: req.user!.userId,
        fileKey: saved.key,          // e.g. "patients/1718123456-abc123-report.pdf"
        fileUrl: saved.url,          // e.g. "/uploads/patients/1718123456-abc123-report.pdf"
        fileType: req.file.mimetype,
        caseBlock: originalFilename, // reusing caseBlock as originalFilename storage
      },
      include: {
        uploader: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    res.status(201).json({
      ...fileRecord,
      originalFilename,
      sizeBytes: saved.sizeBytes,
    });
  } catch (err) {
    next(err);
  }
});

// ── List files ────────────────────────────────────────────────────────────────
router.get("/", authenticate, requireTenant, CLINICAL_ROLES, async (req, res, next) => {
  try {
    const patientId = req.query["patientId"] as string;
    const where: any = { tenantId: req.tenantId!, deletedAt: null };
    if (patientId) where.patientId = patientId;

    const files = await prisma.fileUpload.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        uploader: { select: { id: true, firstName: true, lastName: true } },
      },
    });

    // Enrich with originalFilename (from caseBlock), existence check, and display name
    const enriched = files.map(f => ({
      ...f,
      originalFilename: f.caseBlock ?? path.basename(f.fileKey),
      fileExists: storage.exists(f.fileKey),
    }));

    res.json({ data: enriched, meta: { total: enriched.length, page: 1, limit: enriched.length } });
  } catch (err) {
    next(err);
  }
});

// ── Download ──────────────────────────────────────────────────────────────────
// MUST be before /:id to prevent routing ambiguity
router.get("/:id/download", authenticate, requireTenant, CLINICAL_ROLES, async (req, res, next) => {
  try {
    const id = req.params["id"] as string;
    const fileRecord = await prisma.fileUpload.findFirst({
      where: { id, tenantId: req.tenantId!, deletedAt: null },
    });
    if (!fileRecord) throw Errors.notFound("File");

    if (!storage.exists(fileRecord.fileKey)) {
      throw Errors.notFound("File on disk not found — it may have been deleted or moved");
    }

    // Use original filename for Content-Disposition if available
    const downloadName = fileRecord.caseBlock ?? path.basename(fileRecord.fileKey);
    const stream = storage.stream(fileRecord.fileKey);
    res.setHeader("Content-Type", fileRecord.fileType ?? "application/octet-stream");
    res.setHeader("Content-Disposition", `attachment; filename="${downloadName}"`);
    stream.pipe(res);
  } catch (err) {
    next(err);
  }
});

// ── Get single file metadata ──────────────────────────────────────────────────
router.get("/:id", authenticate, requireTenant, CLINICAL_ROLES, async (req, res, next) => {
  try {
    const id = req.params["id"] as string;
    const fileRecord = await prisma.fileUpload.findFirst({
      where: { id, tenantId: req.tenantId!, deletedAt: null },
    });
    if (!fileRecord) throw Errors.notFound("File");
    res.json({
      ...fileRecord,
      originalFilename: fileRecord.caseBlock ?? path.basename(fileRecord.fileKey),
      fileExists: storage.exists(fileRecord.fileKey),
    });
  } catch (err) {
    next(err);
  }
});

// ── Soft-delete + physical file cleanup ───────────────────────────────────────
router.delete("/:id", authenticate, requireTenant, CLINICAL_ROLES, async (req, res, next) => {
  try {
    const id = req.params["id"] as string;
    const fileRecord = await prisma.fileUpload.findFirst({
      where: { id, tenantId: req.tenantId!, deletedAt: null },
    });
    if (!fileRecord) throw Errors.notFound("File");

    // Soft-delete in DB
    await prisma.fileUpload.update({
      where: { id: fileRecord.id },
      data: { deletedAt: new Date() },
    });

    // Also delete physical file from disk (best-effort)
    try {
      await storage.delete(fileRecord.fileKey);
    } catch {
      // Non-fatal: log if physical delete fails (file may already be gone)
      console.warn(`[files] Could not delete physical file: ${fileRecord.fileKey}`);
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
