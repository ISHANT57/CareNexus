import { Router } from "express";
import multer from "multer";
import { parse } from "csv-parse/sync";
import fs from "fs/promises";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { CLINICAL_ROLES , authorizePermission } from "../middlewares/rbac.js";
import { requireTenant } from "../middlewares/tenantScope.js";
import { getRoleScope } from "../middlewares/roleScope.js";
import { Errors } from "../lib/errors.js";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.post("/patients", authorizePermission("patients", "write"), upload.single("file"), async (req, res, next) => {
  try {
    if (!req.tenantId) throw Errors.validation("A specific tenant must be selected to import patients. Please select a tenant from the switcher.");
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

    // MED-002: pick a clinic within the importing user's clinical scope (not just the first
    // clinic in the tenant), and derive the area from that clinic so they stay consistent.
    const clinicScope = await getRoleScope(req, "clinic");
    const defaultProgram = await prisma.program.findFirst({ where: { tenantId: req.tenantId!, deletedAt: null } });
    const defaultClinic = await prisma.clinic.findFirst({ where: { tenantId: req.tenantId!, deletedAt: null, ...clinicScope } });
    const defaultArea = defaultClinic
      ? await prisma.area.findFirst({ where: { id: defaultClinic.areaId, tenantId: req.tenantId!, deletedAt: null } })
      : null;

    if (!defaultProgram || !defaultClinic || !defaultArea) {
      throw Errors.validation("Cannot import patients without at least one Program, and a Clinic/Area within your assigned scope.");
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
