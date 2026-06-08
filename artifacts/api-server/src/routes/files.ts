import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs/promises";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { CLINICAL_ROLES } from "../middlewares/rbac.js";
import { requireTenant } from "../middlewares/tenantScope.js";
import { Errors } from "../lib/errors.js";

const router = Router();

const uploadDir = path.join(process.cwd(), "uploads");
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err: any) {
      cb(err, uploadDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.post("/", authenticate, requireTenant, CLINICAL_ROLES, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) throw Errors.validation("No file uploaded");

    const patientId = req.body.patientId;
    if (!patientId) throw Errors.validation("patientId is required");

    const fileRecord = await prisma.fileUpload.create({
      data: {
        tenantId: req.tenantId!,
        patientId,
        uploaderId: req.user!.userId,
        fileKey: req.file.filename,
        fileUrl: `/api/files/${req.file.filename}/download`,
        fileType: req.file.mimetype,
      },
    });

    res.status(201).json(fileRecord);
  } catch (err) {
    next(err);
  }
});

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
    res.json({ data: files, meta: { total: files.length, page: 1, limit: files.length } });
  } catch (err) {
    next(err);
  }
});

router.get("/:id", authenticate, requireTenant, CLINICAL_ROLES, async (req, res, next) => {
  try {
    const id = req.params["id"] as string;
    const fileRecord = await prisma.fileUpload.findFirst({
      where: { id, tenantId: req.tenantId!, deletedAt: null },
    });
    if (!fileRecord) throw Errors.notFound("File");
    res.json(fileRecord);
  } catch (err) {
    next(err);
  }
});

router.get("/:fileKey/download", authenticate, requireTenant, CLINICAL_ROLES, async (req, res, next) => {
  try {
    const fileKey = req.params["fileKey"] as string;
    const fileRecord = await prisma.fileUpload.findFirst({
      where: { fileKey, tenantId: req.tenantId!, deletedAt: null },
    });
    if (!fileRecord) throw Errors.notFound("File");

    const filePath = path.join(uploadDir, fileRecord.fileKey);
    res.download(filePath, fileRecord.fileKey);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", authenticate, requireTenant, CLINICAL_ROLES, async (req, res, next) => {
  try {
    const id = req.params["id"] as string;
    const fileRecord = await prisma.fileUpload.findFirst({
      where: { id, tenantId: req.tenantId!, deletedAt: null },
    });
    if (!fileRecord) throw Errors.notFound("File");

    await prisma.fileUpload.update({
      where: { id: fileRecord.id },
      data: { deletedAt: new Date() },
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
