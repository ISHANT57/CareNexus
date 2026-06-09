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

const AppointmentSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  clinicId: z.string().uuid(),
  appointmentDate: z.string().datetime(),
  durationMinutes: z.number().int().min(1).optional(),
  notes: z.string().optional(),
});

const UpdateAppointmentSchema = z.object({
  appointmentDate: z.string().datetime().optional(),
  durationMinutes: z.number().int().min(1).optional(),
  notes: z.string().optional(),
});

router.get("/", CLINICAL_ROLES, async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query);
    const patientId = req.query["patientId"] as string | undefined;
    const doctorId = req.query["doctorId"] as string | undefined;
    const clinicId = req.query["clinicId"] as string | undefined;
    const status = req.query["status"] as any | undefined;

    const roleScope = await getRoleScope(req, "appointment");
    const where: any = { tenantId: req.tenantId!, deletedAt: null, ...roleScope };
    if (patientId) where.patientId = patientId;
    if (doctorId) where.doctorId = doctorId;
    if (clinicId) where.clinicId = clinicId;
    if (status) where.status = status;

    const [total, appointments] = await Promise.all([
      prisma.appointment.count({ where }),
      prisma.appointment.findMany({
        where,
        skip,
        take,
        orderBy: { appointmentDate: "asc" },
        include: { patient: true, doctor: true, clinic: true },
      }),
    ]);
    res.json({ data: appointments, meta: paginationMeta(total, page, limit) });
  } catch (err) { next(err); }
});

router.post("/", CLINICAL_ROLES, validateBody(AppointmentSchema), async (req, res, next) => {
  try {
    const { patientId, doctorId, clinicId, appointmentDate, durationMinutes, notes } = req.body;

    const patient = await prisma.patient.findFirst({ where: { id: patientId, tenantId: req.tenantId!, deletedAt: null } });
    if (!patient) throw Errors.notFound("Patient");

    const doctor = await prisma.user.findFirst({ where: { id: doctorId, tenantId: req.tenantId!, deletedAt: null } });
    if (!doctor) throw Errors.notFound("Doctor");

    const clinic = await prisma.clinic.findFirst({ where: { id: clinicId, tenantId: req.tenantId!, deletedAt: null } });
    if (!clinic) throw Errors.notFound("Clinic");

    const appointment = await prisma.appointment.create({
      data: { 
        tenantId: req.tenantId!, 
        patientId, 
        doctorId, 
        clinicId, 
        appointmentDate: new Date(appointmentDate), 
        durationMinutes: durationMinutes || 30, 
        notes, 
        status: "SCHEDULED" 
      },
      include: { patient: true, doctor: true, clinic: true }
    });
    
    await createAuditLog({ req, entityType: "Appointment", entityId: appointment.id, action: "CREATE", after: req.body });
    
    res.status(201).json(appointment);
  } catch (err) { next(err); }
});

router.get("/:id", CLINICAL_ROLES, async (req, res, next) => {
  try {
    const roleScope = await getRoleScope(req, "appointment");
    const appointment = await prisma.appointment.findFirst({
      where: { id: req.params["id"] as string, deletedAt: null, tenantId: req.tenantId!, ...roleScope },
      include: { patient: true, doctor: true, clinic: true },
    });
    if (!appointment) throw Errors.notFound("Appointment");
    assertTenantMatch(req, appointment.tenantId);

    res.json(appointment);
  } catch (err) {
    next(err);
  }
});

router.patch("/:id", CLINICAL_ROLES, validateBody(UpdateAppointmentSchema), async (req, res, next) => {
  try {
    const roleScope = await getRoleScope(req, "appointment");
    const appointment = await prisma.appointment.findFirst({ 
      where: { id: req.params["id"] as string, deletedAt: null, tenantId: req.tenantId!, ...roleScope } 
    });
    if (!appointment) throw Errors.notFound("Appointment");
    assertTenantMatch(req, appointment.tenantId);

    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: { 
        notes: req.body.notes !== undefined ? req.body.notes : undefined,
        appointmentDate: req.body.appointmentDate ? new Date(req.body.appointmentDate) : undefined,
        durationMinutes: req.body.durationMinutes !== undefined ? req.body.durationMinutes : undefined
      },
      include: { patient: true, doctor: true, clinic: true }
    });
    
    await createAuditLog({ req, entityType: "Appointment", entityId: appointment.id, action: "UPDATE", before: appointment, after: updated });
    res.json(updated);
  } catch (err) { next(err); }
});

router.post("/:id/complete", CLINICAL_ROLES, async (req, res, next) => {
  try {
    const roleScope = await getRoleScope(req, "appointment");
    const appointment = await prisma.appointment.findFirst({ 
      where: { id: req.params["id"] as string, deletedAt: null, tenantId: req.tenantId!, ...roleScope } 
    });
    if (!appointment) throw Errors.notFound("Appointment");
    assertTenantMatch(req, appointment.tenantId);
    if (appointment.status !== "SCHEDULED") throw Errors.conflict("Only SCHEDULED appointments can be completed.");

    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: "COMPLETED" },
      include: { patient: true, doctor: true, clinic: true }
    });
    
    await createAuditLog({ req, entityType: "Appointment", entityId: appointment.id, action: "UPDATE", before: appointment, after: updated });

    // Business Flow: Add Journey Event for Appointment Completion
    await prisma.patientJourneyEvent.create({
      data: {
        patientId: appointment.patientId,
        status: "APPOINTMENT_COMPLETED",
        notes: `Appointment completed with ${updated.doctor?.firstName} ${updated.doctor?.lastName} at ${updated.clinic?.name}`,
        actedBy: req.user!.userId
      }
    });

    res.json(updated);
  } catch (err) { next(err); }
});

router.post("/:id/cancel", CLINICAL_ROLES, async (req, res, next) => {
  try {
    const roleScope = await getRoleScope(req, "appointment");
    const appointment = await prisma.appointment.findFirst({ 
      where: { id: req.params["id"] as string, deletedAt: null, tenantId: req.tenantId!, ...roleScope } 
    });
    if (!appointment) throw Errors.notFound("Appointment");
    assertTenantMatch(req, appointment.tenantId);
    if (appointment.status !== "SCHEDULED") throw Errors.conflict("Only SCHEDULED appointments can be cancelled.");

    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: "CANCELLED" },
      include: { patient: true, doctor: true, clinic: true }
    });
    
    await createAuditLog({ req, entityType: "Appointment", entityId: appointment.id, action: "UPDATE", before: appointment, after: updated });
    res.json(updated);
  } catch (err) { next(err); }
});

router.post("/:id/no-show", CLINICAL_ROLES, async (req, res, next) => {
  try {
    const roleScope = await getRoleScope(req, "appointment");
    const appointment = await prisma.appointment.findFirst({ 
      where: { id: req.params["id"] as string, deletedAt: null, tenantId: req.tenantId!, ...roleScope } 
    });
    if (!appointment) throw Errors.notFound("Appointment");
    assertTenantMatch(req, appointment.tenantId);
    if (appointment.status !== "SCHEDULED") throw Errors.conflict("Only SCHEDULED appointments can be marked NO_SHOW.");

    const updated = await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: "NO_SHOW" },
      include: { patient: true, doctor: true, clinic: true }
    });
    
    await createAuditLog({ req, entityType: "Appointment", entityId: appointment.id, action: "UPDATE", before: appointment, after: updated });
    res.json(updated);
  } catch (err) { next(err); }
});

export { router as appointmentsRouter };
