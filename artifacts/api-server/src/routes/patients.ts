import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { CLINICAL_ROLES, ADMIN_ROLES } from "../middlewares/rbac.js";
import { requireTenant, assertTenantMatch } from "../middlewares/tenantScope.js";
import { validateBody } from "../middlewares/validate.js";
import { Errors, paginate, paginationMeta } from "../types/index.js";
import { createAuditLog } from "../lib/audit.js";
import { PatientService } from "../services/PatientService.js";

const router = Router();
const patientService = new PatientService();
router.use(authenticate, requireTenant);

const GpSchema = z.object({
  gpName: z.string().optional().nullable(),
  gpOrgName: z.string().optional().nullable(),
  gpNationalPracticeCode: z.string().optional().nullable(),
  gpEmail: z.string().email().optional().nullable(),
  gpAddress: z.string().optional().nullable(),
  gpPostCode: z.string().optional().nullable(),
  gpCity: z.string().optional().nullable(),
  gpDistrict: z.string().optional().nullable(),
  gpCountry: z.string().optional().nullable(),
  gpSelected: z.boolean().optional(),
  icbSelected: z.boolean().optional(),
});

const ReferralSchema = z.object({
  referralSource: z.string().optional().nullable(),
  referralText: z.string().optional().nullable(),
  referralDate: z.string().datetime().optional().nullable(),
  contract: z.string().optional().nullable(),
  contractOther: z.string().optional().nullable(),
});

const PatientSchema = z.object({
  programId: z.string().uuid(),
  clinicId: z.string().uuid(),
  areaId: z.string().uuid(),
  nhsNumber: z.string().min(1).max(20),
  title: z.string().max(20).optional().nullable(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().optional().nullable(),
  mobile: z.string().min(1).max(20),
  altMobile: z.string().max(20).optional().nullable(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().nullable(),
  dob: z.string().datetime().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postalCode: z.string().max(11).optional().nullable(),
  country: z.string().optional().nullable(),
  ethnicity: z.string().optional().nullable(),
  patientGroup: z.enum(["NEW_PATIENT", "REFERRED_FOR_REVIEW", "TRANSITION_FROM_CAMHS", "TRANSITION_ADULT"]).optional().nullable(),
  userType: z.enum(["PRIVATE", "RTC", "ICB_CONTRACT"]).optional().nullable(),
  emisId: z.string().optional().nullable(),
  isTest: z.boolean().optional(),
  gpDetails: GpSchema.optional(),
  referral: ReferralSchema.optional(),
});

const JourneySchema = z.object({
  status: z.enum(["NEW", "PSI", "DISCHARGE", "MEDICATION_REQUIRED"]),
  notes: z.string().max(1000).optional().nullable(),
});

// GET /api/patients
router.get("/", CLINICAL_ROLES, async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query);
    const { clinicId, areaId, programId, journeyStatus, patientGroup, userType, q } = req.query as Record<string, string>;

    const where: Record<string, unknown> = { tenantId: req.tenantId!, deletedAt: null };
    if (clinicId) where["clinicId"] = clinicId;
    if (areaId) where["areaId"] = areaId;
    if (programId) where["programId"] = programId;
    if (patientGroup) where["patientGroup"] = patientGroup;
    if (userType) where["userType"] = userType;
    if (q) where["OR"] = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { nhsNumber: { contains: q } },
      { mobile: { contains: q } },
    ];
    if (journeyStatus) {
      where["journeyEvents"] = { some: { status: journeyStatus } };
    }

    const [total, patients] = await Promise.all([
      prisma.patient.count({ where }),
      prisma.patient.findMany({
        where, skip, take, orderBy: { createdAt: "desc" },
        select: {
          id: true, nhsNumber: true, firstName: true, lastName: true, mobile: true,
          status: true, patientGroup: true, userType: true, isTest: true,
          registrationDate: true, firstConsultationDate: true,
          program: { select: { id: true, name: true } },
          clinic: { select: { id: true, name: true } },
          area: { select: { id: true, name: true } },
          doctorAssignments: {
            where: { deletedAt: null },
            take: 1,
            orderBy: { createdAt: "desc" },
            include: { doctor: { select: { id: true, firstName: true, lastName: true } } },
          },
          journeyEvents: { orderBy: { createdAt: "desc" }, take: 1, select: { status: true, createdAt: true } },
        },
      }),
    ]);

    res.json({ data: patients, meta: paginationMeta(total, page, limit) });
  } catch (err) { next(err); }
});

// GET /api/patients/:id
router.get("/:id", CLINICAL_ROLES, async (req, res, next) => {
  try {
    const patient = await prisma.patient.findFirst({
      where: { id: req.params["id"] as string, tenantId: req.tenantId!, deletedAt: null },
      include: {
        program: { select: { id: true, name: true } },
        clinic: { select: { id: true, name: true } },
        area: { select: { id: true, name: true } },
        gpDetails: true,
        referrals: { orderBy: { createdAt: "desc" } },
        journeyEvents: {
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { actedByUser: { select: { id: true, firstName: true, lastName: true } } },
        },
        doctorAssignments: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 1,
          include: { doctor: { select: { id: true, firstName: true, lastName: true } } },
        },
      },
    });
    if (!patient) throw Errors.notFound("Patient");
    res.json(patient);
  } catch (err) { next(err); }
});

// POST /api/patients
router.post("/", ADMIN_ROLES, validateBody(PatientSchema), async (req, res, next) => {
  try {
    const { gpDetails, referral, ...patientData } = req.body as z.infer<typeof PatientSchema>;

    const existing = await prisma.patient.findUnique({
      where: { tenantId_nhsNumber: { tenantId: req.tenantId!, nhsNumber: patientData.nhsNumber } },
    });
    if (existing) throw Errors.conflict("Patient with this NHS Number already exists in the tenant");

    const patient = await patientService.createPatient({
      ...patientData,
      tenantId: req.tenantId!,
      createdBy: req.user!.userId,
      gpDetails: gpDetails ? { create: gpDetails } : undefined,
      referrals: referral ? { create: { ...referral, createdBy: req.user!.userId } } : undefined,
      journeyEvents: { create: { status: "NEW", actedBy: req.user!.userId } },
    });

    await createAuditLog({ req, entityType: "Patient", entityId: patient.id, action: "CREATE", after: { nhsNumber: patient.nhsNumber } });
    res.status(201).json(patient);
  } catch (err) { next(err); }
});

// PATCH /api/patients/:id
router.patch("/:id", CLINICAL_ROLES, validateBody(PatientSchema.partial().omit({ gpDetails: true, referral: true })), async (req, res, next) => {
  try {
    const patient = await prisma.patient.findFirst({ where: { id: req.params["id"] as string, deletedAt: null } });
    if (!patient) throw Errors.notFound("Patient");
    assertTenantMatch(req, patient.tenantId);
    const updated = await patientService.updatePatient(patient.id, { ...req.body, updatedBy: req.user!.userId });
    await createAuditLog({ req, entityType: "Patient", entityId: patient.id, action: "UPDATE", before: patient, after: req.body });
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /api/patients/:id
router.delete("/:id", ADMIN_ROLES, async (req, res, next) => {
  try {
    const patient = await prisma.patient.findFirst({ where: { id: req.params["id"] as string, deletedAt: null } });
    if (!patient) throw Errors.notFound("Patient");
    assertTenantMatch(req, patient.tenantId);
    await patientService.deletePatient(patient.id);
    await createAuditLog({ req, entityType: "Patient", entityId: patient.id, action: "DELETE" });
    res.status(204).send();
  } catch (err) { next(err); }
});

// GET /api/patients/:id/journey
router.get("/:id/journey", CLINICAL_ROLES, async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query);
    const patient = await prisma.patient.findFirst({ where: { id: req.params["id"] as string, tenantId: req.tenantId!, deletedAt: null } });
    if (!patient) throw Errors.notFound("Patient");
    const [total, events] = await Promise.all([
      prisma.patientJourneyEvent.count({ where: { patientId: patient.id } }),
      prisma.patientJourneyEvent.findMany({
        where: { patientId: patient.id },
        orderBy: { createdAt: "desc" }, skip, take,
        include: { actedByUser: { select: { id: true, firstName: true, lastName: true, role: { select: { name: true } } } } },
      }),
    ]);
    res.json({ data: events, meta: paginationMeta(total, page, limit) });
  } catch (err) { next(err); }
});

// POST /api/patients/:id/journey
router.post("/:id/journey", CLINICAL_ROLES, validateBody(JourneySchema), async (req, res, next) => {
  try {
    const patient = await prisma.patient.findFirst({ where: { id: req.params["id"] as string, tenantId: req.tenantId!, deletedAt: null } });
    if (!patient) throw Errors.notFound("Patient");
    const event = await prisma.patientJourneyEvent.create({
      data: { patientId: patient.id, status: req.body.status, notes: req.body.notes, actedBy: req.user!.userId },
      include: { actedByUser: { select: { id: true, firstName: true, lastName: true } } },
    });
    if (req.body.status === "DISCHARGE") {
      await prisma.patient.update({ where: { id: patient.id }, data: { isDischarge: true } });
    }
    await createAuditLog({ req, entityType: "PatientJourneyEvent", entityId: event.id, action: "CREATE", after: { status: event.status } });
    res.status(201).json(event);
  } catch (err) { next(err); }
});

// PATCH /api/patients/:id/status — dedicated status update endpoint
const StatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"]),
  notes: z.string().max(500).optional().nullable(),
});

router.patch("/:id/status", CLINICAL_ROLES, validateBody(StatusSchema), async (req, res, next) => {
  try {
    const patient = await prisma.patient.findFirst({ where: { id: req.params["id"] as string, tenantId: req.tenantId!, deletedAt: null } });
    if (!patient) throw Errors.notFound("Patient");
    const { status, notes } = req.body as z.infer<typeof StatusSchema>;
    const updated = await prisma.patient.update({ where: { id: patient.id }, data: { status } });
    // Record status change as journey event if notes provided
    if (notes) {
      await prisma.patientJourneyEvent.create({
        data: { patientId: patient.id, status: "NEW", notes: `Status changed to ${status}. ${notes}`, actedBy: req.user!.userId },
      });
    }
    await createAuditLog({ req, entityType: "Patient", entityId: patient.id, action: "UPDATE", before: { status: patient.status }, after: { status } });
    res.json(updated);
  } catch (err) { next(err); }
});

// PATCH /api/patients/:id/gp
router.patch("/:id/gp", CLINICAL_ROLES, validateBody(GpSchema), async (req, res, next) => {
  try {
    const patient = await prisma.patient.findFirst({ where: { id: req.params["id"] as string, tenantId: req.tenantId!, deletedAt: null } });
    if (!patient) throw Errors.notFound("Patient");
    const gp = await prisma.patientGpDetails.upsert({
      where: { patientId: patient.id },
      update: req.body,
      create: { patientId: patient.id, ...req.body },
    });
    res.json(gp);
  } catch (err) { next(err); }
});

// GET /api/patients/:id/communications
router.get("/:id/communications", CLINICAL_ROLES, async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query);
    const patient = await prisma.patient.findFirst({ where: { id: req.params["id"] as string, tenantId: req.tenantId!, deletedAt: null } });
    if (!patient) throw Errors.notFound("Patient");
    const [total, comms] = await Promise.all([
      prisma.smsCommunication.count({ where: { patientId: patient.id } }),
      prisma.smsCommunication.findMany({
        where: { patientId: patient.id },
        orderBy: { createdAt: "desc" }, skip, take,
      }),
    ]);
    res.json({ data: comms, meta: paginationMeta(total, page, limit) });
  } catch (err) { next(err); }
});

export default router;
