import { Router } from "express";
import multer from "multer";
import { parse } from "csv-parse/sync";
import fs from "fs/promises";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { CLINICAL_ROLES , authorizePermission } from "../middlewares/rbac.js";
import { requireTenant } from "../middlewares/tenantScope.js";
import { Errors } from "../lib/errors.js";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post("/patients", authorizePermission("patients", "write"), upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) throw Errors.validation("No CSV file uploaded");

    const fileContent = await fs.readFile(req.file.path, "utf-8");
    await fs.unlink(req.file.path).catch(() => {});

    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    if (records.length === 0) throw Errors.validation("CSV is empty");

    let successCount = 0;
    const errors: Array<{ row: number; error: string }> = [];

    let defaultProgram = await prisma.program.findFirst({ where: { tenantId: req.tenantId! } });
    let defaultClinic = await prisma.clinic.findFirst({ where: { tenantId: req.tenantId! } });
    let defaultArea = await prisma.area.findFirst({ where: { tenantId: req.tenantId! } });

    if (!defaultProgram || !defaultClinic || !defaultArea) {
      throw new Error("Cannot import patients without at least one Program, Clinic, and Area in the system.");
    }

    for (let i = 0; i < records.length; i++) {
      const record: any = records[i];
      try {
        if (!record.firstName || !record.lastName) {
          throw new Error("firstName and lastName are required");
        }
        await prisma.patient.create({
          data: {
            tenantId: req.tenantId!,
            firstName: record.firstName,
            lastName: record.lastName,
            email: record.email || null,
            mobile: record.mobile || "0000000000",
            dob: record.dateOfBirth ? new Date(record.dateOfBirth) : null,
            nhsNumber: record.nhsNumber || `NHS-${Date.now()}-${i}`,
            status: "ACTIVE",
            programId: defaultProgram.id,
            clinicId: defaultClinic.id,
            areaId: defaultArea.id,
          },
        });
        successCount++;
      } catch (err: any) {
        errors.push({ row: i + 2, error: err.message || "Unknown error" });
      }
    }

    res.status(201).json({
      success: true,
      processed: records.length,
      successCount,
      errorCount: errors.length,
      errors,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
