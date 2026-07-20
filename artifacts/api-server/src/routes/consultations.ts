import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { authorizePermission } from "../middlewares/rbac.js";
import { requireTenant, assertTenantMatch } from "../middlewares/tenantScope.js";
import { validateBody } from "../middlewares/validate.js";
import { Errors, paginate, paginationMeta } from "../types/index.js";
import { createAuditLog } from "../lib/audit.js";
import { getRoleScope } from "../middlewares/roleScope.js";

const router = Router();
router.use(authenticate, requireTenant);
// Trigger dev server reload to pick up Prisma client changes

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

router.get("/", authorizePermission("consultations", "read"), async (req, res, next) => {
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

router.post("/", authorizePermission("consultations", "write"), validateBody(ConsultationSchema), async (req, res, next) => {
  try {
    const { patientId, appointmentId, doctorId, clinicId, chiefComplaint, symptoms, observations, diagnosis, treatmentPlan, medications, followUpInstructions, consultationDate } = req.body;

    const patientRoleScope = await getRoleScope(req, "patient");
    const appointmentRoleScope = await getRoleScope(req, "appointment");

    const [patient, appointment, doctor, clinic] = await Promise.all([
      prisma.patient.findFirst({ where: { id: patientId, tenantId: req.tenantId!, deletedAt: null, ...patientRoleScope } }),
      prisma.appointment.findFirst({ where: { id: appointmentId, tenantId: req.tenantId!, deletedAt: null, ...appointmentRoleScope } }),
      prisma.user.findFirst({ where: { id: doctorId, tenantAssignments: { some: { tenantId: req.tenantId! } }, deletedAt: null } }),
      prisma.clinic.findFirst({ where: { id: clinicId, tenantId: req.tenantId!, deletedAt: null } })
    ]);

    if (!patient) throw Errors.notFound("Patient");
    if (!appointment) throw Errors.notFound("Appointment");
    if (!doctor) throw Errors.notFound("Doctor");
    if (!clinic) throw Errors.notFound("Clinic");

    // Enforce relationship and hierarchy check
    if (appointment.patientId !== patientId) {
      throw Errors.badRequest("Appointment does not match patient");
    }
    if (appointment.doctorId !== doctorId) {
      throw Errors.badRequest("Appointment does not match doctor");
    }
    if (appointment.clinicId !== clinicId) {
      throw Errors.badRequest("Appointment does not match clinic");
    }

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

router.get("/:id", authorizePermission("consultations", "read"), async (req, res, next) => {
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

router.patch("/:id", authorizePermission("consultations", "write"), validateBody(UpdateConsultationSchema), async (req, res, next) => {
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

router.delete("/:id", authorizePermission("consultations", "write"), async (req, res, next) => {
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
