import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { CLINICAL_ROLES } from "../middlewares/rbac.js";
import { requireTenant, assertTenantMatch } from "../middlewares/tenantScope.js";
import { validateBody } from "../middlewares/validate.js";
import { Errors, paginate, paginationMeta } from "../types/index.js";
import { createAuditLog } from "../lib/audit.js";
import { getRoleScope } from "../middlewares/roleScope.js";

const router = Router();
router.use(authenticate, requireTenant);

const ConsultationSchema = z.object({
  patientId: z.string().uuid(),
  appointmentId: z.string().uuid(),
  doctorId: z.string().uuid(),
  clinicId: z.string().uuid(),
  chiefComplaint: z.string(),
  symptoms: z.string(),
  observations: z.string(),
  diagnosis: z.string(),
  treatmentPlan: z.string(),
  medications: z.string(),
  followUpInstructions: z.string(),
  consultationDate: z.string().datetime().optional()
});

const UpdateConsultationSchema = z.object({
  chiefComplaint: z.string().optional(),
  symptoms: z.string().optional(),
  observations: z.string().optional(),
  diagnosis: z.string().optional(),
  treatmentPlan: z.string().optional(),
  medications: z.string().optional(),
  followUpInstructions: z.string().optional(),
});

router.get("/", CLINICAL_ROLES, async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query);
    const patientId = req.query["patientId"] as string | undefined;
    const doctorId = req.query["doctorId"] as string | undefined;
    const clinicId = req.query["clinicId"] as string | undefined;

    const roleScope = await getRoleScope(req, "consultation");
    const where: any = { tenantId: req.tenantId!, deletedAt: null, ...roleScope };
    if (patientId) where.patientId = patientId;
    if (doctorId) where.doctorId = doctorId;
    if (clinicId) where.clinicId = clinicId;

    const [total, consultations] = await Promise.all([
      prisma.consultation.count({ where }),
      prisma.consultation.findMany({
        where,
        skip,
        take,
        orderBy: { consultationDate: "desc" },
        include: { patient: true, doctor: true, clinic: true, appointment: true },
      }),
    ]);
    res.json({ data: consultations, meta: paginationMeta(total, page, limit) });
  } catch (err) { next(err); }
});

router.post("/", CLINICAL_ROLES, validateBody(ConsultationSchema), async (req, res, next) => {
  try {
    const { patientId, appointmentId, doctorId, clinicId, chiefComplaint, symptoms, observations, diagnosis, treatmentPlan, medications, followUpInstructions, consultationDate } = req.body;

    const [patient, appointment] = await Promise.all([
      prisma.patient.findFirst({ where: { id: patientId, tenantId: req.tenantId!, deletedAt: null } }),
      prisma.appointment.findFirst({ where: { id: appointmentId, tenantId: req.tenantId!, deletedAt: null } })
    ]);

    if (!patient) throw Errors.notFound("Patient");
    if (!appointment) throw Errors.notFound("Appointment");

    // Check if consultation already exists for this appointment
    const existing = await prisma.consultation.findFirst({ where: { appointmentId } });
    if (existing) {
      throw Errors.badRequest("A consultation already exists for this appointment");
    }

    const consultation = await prisma.consultation.create({
      data: {
        tenantId: req.tenantId!,
        patientId,
        appointmentId,
        doctorId,
        clinicId,
        chiefComplaint,
        symptoms,
        observations,
        diagnosis,
        treatmentPlan,
        medications,
        followUpInstructions,
        consultationDate: consultationDate ? new Date(consultationDate) : undefined
      },
      include: { patient: true, doctor: true, clinic: true, appointment: true }
    });

    // Automatically create a journey event
    await prisma.patientJourneyEvent.create({
      data: {
        patientId,
        status: "CONSULTATION_COMPLETED",
        notes: `Consultation completed for appointment on ${appointment.appointmentDate.toISOString()}`,
        actedBy: doctorId
      }
    });

    await createAuditLog({ req, entityType: "Consultation", entityId: consultation.id, action: "CREATE", after: consultation });
    
    res.status(201).json(consultation);
  } catch (err) { next(err); }
});

router.get("/:id", CLINICAL_ROLES, async (req, res, next) => {
  try {
    const roleScope = await getRoleScope(req, "consultation");
    const consultation = await prisma.consultation.findFirst({
      where: { id: req.params["id"] as string, deletedAt: null, tenantId: req.tenantId!, ...roleScope },
      include: { patient: true, doctor: true, clinic: true, appointment: true },
    });
    if (!consultation) throw Errors.notFound("Consultation");
    assertTenantMatch(req, consultation.tenantId);

    res.json(consultation);
  } catch (err) { next(err); }
});

router.patch("/:id", CLINICAL_ROLES, validateBody(UpdateConsultationSchema), async (req, res, next) => {
  try {
    const roleScope = await getRoleScope(req, "consultation");
    const consultation = await prisma.consultation.findFirst({ 
      where: { id: req.params["id"] as string, deletedAt: null, tenantId: req.tenantId!, ...roleScope } 
    });
    if (!consultation) throw Errors.notFound("Consultation");
    assertTenantMatch(req, consultation.tenantId);

    const updated = await prisma.consultation.update({
      where: { id: consultation.id },
      data: {
        chiefComplaint: req.body.chiefComplaint !== undefined ? req.body.chiefComplaint : undefined,
        symptoms: req.body.symptoms !== undefined ? req.body.symptoms : undefined,
        observations: req.body.observations !== undefined ? req.body.observations : undefined,
        diagnosis: req.body.diagnosis !== undefined ? req.body.diagnosis : undefined,
        treatmentPlan: req.body.treatmentPlan !== undefined ? req.body.treatmentPlan : undefined,
        medications: req.body.medications !== undefined ? req.body.medications : undefined,
        followUpInstructions: req.body.followUpInstructions !== undefined ? req.body.followUpInstructions : undefined,
      },
      include: { patient: true, doctor: true, clinic: true, appointment: true }
    });
    
    await createAuditLog({ req, entityType: "Consultation", entityId: consultation.id, action: "UPDATE", before: consultation, after: updated });
    res.json(updated);
  } catch (err) { next(err); }
});

router.delete("/:id", CLINICAL_ROLES, async (req, res, next) => {
  try {
    const roleScope = await getRoleScope(req, "consultation");
    const consultation = await prisma.consultation.findFirst({ 
      where: { id: req.params["id"] as string, deletedAt: null, tenantId: req.tenantId!, ...roleScope } 
    });
    if (!consultation) throw Errors.notFound("Consultation");
    assertTenantMatch(req, consultation.tenantId);

    const deleted = await prisma.consultation.update({
      where: { id: consultation.id },
      data: { deletedAt: new Date() },
    });

    await createAuditLog({ req, entityType: "Consultation", entityId: consultation.id, action: "DELETE", before: consultation });
    res.status(204).send();
  } catch (err) { next(err); }
});

export const consultationsRouter = router;
