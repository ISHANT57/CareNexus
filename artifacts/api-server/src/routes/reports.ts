import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { requireTenant } from "../middlewares/tenantScope.js";

const router = Router();
router.use(authenticate, requireTenant);

// GET /api/reports/dashboard
router.get("/dashboard", async (req, res, next) => {
  try {
    const tenantId = req.tenantId!;
    const base = { tenantId, deletedAt: null };
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalPatients,
      activePatients,
      totalUsers,
      totalClinics,
      totalPrograms,
      newPatientsThisMonth,
      pendingCommunications,
    ] = await Promise.all([
      prisma.patient.count({ where: base }),
      prisma.patient.count({ where: { ...base, status: "ACTIVE" } }),
      prisma.user.count({ where: base }),
      prisma.clinic.count({ where: base }),
      prisma.program.count({ where: base }),
      prisma.patient.count({ where: { ...base, createdAt: { gte: firstOfMonth } } }),
      prisma.smsCommunication.count({ where: { tenantId, status: { in: ["QUEUED", "SENT"] } } }),
    ]);

    res.json({
      totalPatients,
      activePatients,
      totalUsers,
      totalClinics,
      totalPrograms,
      newPatientsThisMonth,
      pendingCommunications,
    });
  } catch (err) { next(err); }
});

// GET /api/reports/enrollment-stats
router.get("/enrollment-stats", async (req, res, next) => {
  try {
    const tenantId = req.tenantId!;
    const base = { tenantId, deletedAt: null };

    const [
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
    ] = await Promise.all([
      prisma.programEnrollment.count({ where: base }),
      prisma.programEnrollment.count({ where: { ...base, status: "ACTIVE" } }),
      prisma.programEnrollment.count({ where: { ...base, status: "COMPLETED" } }),
    ]);

    const rows = await prisma.programEnrollment.groupBy({
      by: ["programId"],
      where: base,
      _count: { id: true },
    });
    
    const programIds = rows.map((r) => r.programId).filter(Boolean) as string[];
    const programs = await prisma.program.findMany({
      where: { id: { in: programIds } },
      select: { id: true, name: true },
    });
    const nameMap = Object.fromEntries(programs.map((p) => [p.id, p.name]));
    
    const enrollmentsByProgram = rows.map((r) => ({
      programId: r.programId ?? "",
      programName: nameMap[r.programId ?? ""] ?? "Unknown",
      count: r._count.id,
    }));

    res.json({
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      enrollmentsByProgram,
    });
  } catch (err) { next(err); }
});

// GET /api/reports/consultation-stats
router.get("/consultation-stats", async (req, res, next) => {
  try {
    const tenantId = req.tenantId!;
    const base = { tenantId, deletedAt: null };
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalConsultations,
      consultationsThisMonth,
    ] = await Promise.all([
      prisma.consultation.count({ where: base }),
      prisma.consultation.count({ where: { ...base, createdAt: { gte: firstOfMonth } } })
    ]);

    const rows = await prisma.consultation.groupBy({
      by: ["doctorId"],
      where: base,
      _count: { id: true },
    });
    
    const userIds = rows.map((r) => r.doctorId).filter(Boolean) as string[];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true },
    });
    const nameMap = Object.fromEntries(users.map((u) => [u.id, `${u.firstName} ${u.lastName}`]));
    
    const consultationsByDoctor = rows.map((r) => ({
      doctorId: r.doctorId ?? "",
      doctorName: nameMap[r.doctorId ?? ""] ?? "Unknown",
      count: r._count.id,
    }));

    res.json({
      totalConsultations,
      consultationsThisMonth,
      consultationsByDoctor,
    });
  } catch (err) { next(err); }
});

// GET /api/reports/patients-by-status
router.get("/patients-by-status", async (req, res, next) => {
  try {
    const rows = await prisma.patient.groupBy({
      by: ["status"],
      where: { tenantId: req.tenantId!, deletedAt: null },
      _count: { id: true },
    });
    res.json(rows.map((r) => ({ status: r.status, count: r._count.id })));
  } catch (err) { next(err); }
});

// GET /api/reports/patients-by-program
router.get("/patients-by-program", async (req, res, next) => {
  try {
    const rows = await prisma.patient.groupBy({
      by: ["programId"],
      where: { tenantId: req.tenantId!, deletedAt: null },
      _count: { id: true },
    });
    const programIds = rows.map((r) => r.programId).filter(Boolean) as string[];
    const programs = await prisma.program.findMany({
      where: { id: { in: programIds } },
      select: { id: true, name: true },
    });
    const nameMap = Object.fromEntries(programs.map((p) => [p.id, p.name]));
    res.json(
      rows.map((r) => ({
        programId: r.programId ?? "",
        programName: nameMap[r.programId ?? ""] ?? "Unknown",
        count: r._count.id,
      }))
    );
  } catch (err) { next(err); }
});

// GET /api/reports/recent-activity
router.get("/recent-activity", async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query["limit"]) || 20, 100);
    const logs = await prisma.auditLog.findMany({
      where: { tenantId: req.tenantId! },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        actor: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
    });
    res.json(logs);
  } catch (err) { next(err); }
});

// GET /api/reports/appointment-stats
router.get("/appointment-stats", async (req, res, next) => {
  try {
    const tenantId = req.tenantId!;
    const base = { tenantId, deletedAt: null };

    const [
      totalAppointments,
      scheduledAppointments,
      completedAppointments,
      cancelledAppointments
    ] = await Promise.all([
      prisma.appointment.count({ where: base }),
      prisma.appointment.count({ where: { ...base, status: "SCHEDULED" } }),
      prisma.appointment.count({ where: { ...base, status: "COMPLETED" } }),
      prisma.appointment.count({ where: { ...base, status: "CANCELLED" } }),
    ]);

    const clinicRows = await prisma.appointment.groupBy({
      by: ["clinicId"],
      where: base,
      _count: { id: true },
    });
    const clinicIds = clinicRows.map(r => r.clinicId).filter(Boolean) as string[];
    const clinics = await prisma.clinic.findMany({ where: { id: { in: clinicIds } }, select: { id: true, name: true }});
    const clinicNameMap = Object.fromEntries(clinics.map(c => [c.id, c.name]));

    const doctorRows = await prisma.appointment.groupBy({
      by: ["doctorId"],
      where: base,
      _count: { id: true },
    });
    const doctorIds = doctorRows.map(r => r.doctorId).filter(Boolean) as string[];
    const doctors = await prisma.user.findMany({ where: { id: { in: doctorIds } }, select: { id: true, firstName: true, lastName: true }});
    const doctorNameMap = Object.fromEntries(doctors.map(d => [d.id, `${d.firstName} ${d.lastName}`.trim()]));

    res.json({
      totalAppointments,
      scheduledAppointments,
      completedAppointments,
      cancelledAppointments,
      appointmentsByClinic: clinicRows.map(r => ({
        clinicId: r.clinicId ?? "",
        clinicName: clinicNameMap[r.clinicId ?? ""] ?? "Unknown",
        count: r._count.id
      })),
      appointmentsByDoctor: doctorRows.map(r => ({
        doctorId: r.doctorId ?? "",
        doctorName: doctorNameMap[r.doctorId ?? ""] ?? "Unknown",
        count: r._count.id
      })),
    });
  } catch (err) { next(err); }
});

export default router;
