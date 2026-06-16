import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { requireTenant } from "../middlewares/tenantScope.js";
import { getRoleScope } from "../middlewares/roleScope.js";
import { authorizePermission } from "../middlewares/rbac.js";

const router = Router();
router.use(authenticate, requireTenant, authorizePermission("reports", "read"));

// GET /api/reports/dashboard
router.get("/dashboard", async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    // Patient-shaped scope is valid on Patient (clinicId / doctorAssignments). For models that
    // do not carry those columns (User, Clinic, SmsCommunication, PatientOutcome) we either keep
    // tenant-level totals (org config) or scope through the `patient` relation (HIGH-003).
    const patientScope = await getRoleScope(req, "patient");
    const hasScope = Object.keys(patientScope).length > 0;
    const tenantBase = { tenantId, deletedAt: null };
    const patientBase = { ...tenantBase, ...patientScope };
    const outcomeWhere = hasScope ? { ...tenantBase, patient: patientScope } : tenantBase;
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
      outcomesRecorded,
    ] = await Promise.all([
      prisma.patient.count({ where: patientBase }),
      prisma.patient.count({ where: { ...patientBase, status: "ACTIVE" } }),
      prisma.user.count({ where: tenantBase }),
      prisma.clinic.count({ where: tenantBase }),
      prisma.program.count({ where: tenantBase }),
      prisma.patient.count({ where: { ...patientBase, createdAt: { gte: firstOfMonth } } }),
      prisma.smsCommunication.count({ where: { tenantId, status: { in: ["QUEUED", "SENT"] }, ...(hasScope ? { patient: patientScope } : {}) } }),
      prisma.patientOutcome.count({ where: outcomeWhere }),
    ]);

    // Improvement rate: outcomes where currentValue moved toward targetValue
    const allOutcomes = await prisma.patientOutcome.findMany({ where: outcomeWhere, select: { baselineValue: true, currentValue: true, targetValue: true } });
    const improving = allOutcomes.filter(o => {
      const totalRange = Math.abs(o.targetValue - o.baselineValue);
      if (totalRange === 0) return false;
      const progress = Math.abs(o.currentValue - o.baselineValue);
      return progress > 0 && Math.sign(o.targetValue - o.baselineValue) === Math.sign(o.currentValue - o.baselineValue);
    });
    const successRate = allOutcomes.length > 0 ? Math.round((improving.length / allOutcomes.length) * 1000) / 10 : 0;

    res.json({
      totalPatients,
      activePatients,
      totalUsers,
      totalClinics,
      totalPrograms,
      newPatientsThisMonth,
      pendingCommunications,
      outcomesRecorded,
      improvingPatients: improving.length,
      successRate,
    });
  } catch (err) { next(err); }
});


// GET /api/reports/enrollment-stats
router.get("/enrollment-stats", async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    // ProgramEnrollment has no clinic/doctor columns — scope through the patient relation.
    const patientScope = await getRoleScope(req, "patient");
    const hasScope = Object.keys(patientScope).length > 0;
    const base = { tenantId, deletedAt: null, ...(hasScope ? { patient: patientScope } : {}) };

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
    const tenantId = req.tenantId;
    const roleScope = await getRoleScope(req, "consultation");
    const base = { tenantId, deletedAt: null, ...roleScope };

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
      where: { tenantId: req.tenantId!, deletedAt: null, ...await getRoleScope(req, "dashboard") },
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
      where: { tenantId: req.tenantId!, deletedAt: null, ...await getRoleScope(req, "dashboard") },
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
    // HIGH-003: AuditLog has no clinic/patient columns to scope by. Tenant admins manage the
    // whole org and may see tenant-wide activity; clinicians (DOCTOR/OPERATOR/STAFF) are
    // restricted to their own actions so the dashboard does not leak trust-wide activity.
    const role = req.user?.role;
    const activityWhere: Record<string, unknown> = { tenantId: req.tenantId! };
    if (role !== "SUPER_ADMIN" && role !== "AREA_ADMIN" && role !== "CLINIC_ADMIN") {
      activityWhere["actorId"] = req.user!.userId;
    }
    const logs = await prisma.auditLog.findMany({
      where: activityWhere,
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
    const tenantId = req.tenantId;
    const roleScope = await getRoleScope(req, "appointment");
    const base = { tenantId, deletedAt: null, ...roleScope };

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

// GET /api/reports/consultations-by-clinic
router.get("/consultations-by-clinic", async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const roleScope = await getRoleScope(req, "consultation");
    const base = { tenantId, deletedAt: null, ...roleScope };

    const rows = await prisma.consultation.groupBy({
      by: ["clinicId"],
      where: base,
      _count: { id: true },
    });
    const clinicIds = rows.map((r) => r.clinicId).filter(Boolean) as string[];
    const clinics = await prisma.clinic.findMany({
      where: { id: { in: clinicIds } },
      select: { id: true, name: true },
    });
    const nameMap = Object.fromEntries(clinics.map((c) => [c.id, c.name]));

    res.json(rows.map((r) => ({
      clinicId: r.clinicId ?? "",
      clinicName: nameMap[r.clinicId ?? ""] ?? "Unknown",
      count: r._count.id,
    })));
  } catch (err) { next(err); }
});

// GET /api/reports/consultations-by-program
router.get("/consultations-by-program", async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const base = { tenantId, deletedAt: null };

    // Join through patients to get program
    const consultations = await prisma.consultation.findMany({
      where: base,
      include: { patient: { select: { programId: true } } },
    });

    const programCountMap: Record<string, number> = {};
    for (const c of consultations) {
      const programId = c.patient?.programId ?? "none";
      programCountMap[programId] = (programCountMap[programId] ?? 0) + 1;
    }

    const programIds = Object.keys(programCountMap).filter((id) => id !== "none");
    const programs = await prisma.program.findMany({
      where: { id: { in: programIds } },
      select: { id: true, name: true },
    });
    const nameMap = Object.fromEntries(programs.map((p) => [p.id, p.name]));

    res.json(Object.entries(programCountMap).map(([programId, count]) => ({
      programId,
      programName: nameMap[programId] ?? (programId === "none" ? "No Program" : "Unknown"),
      count,
    })));
  } catch (err) { next(err); }
});

// GET /api/reports/follow-ups
router.get("/follow-ups", async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    // Scope by consultation role-scope so this PII-bearing report respects doctor/clinic visibility.
    const consultationScope = await getRoleScope(req, "consultation");
    const base = { tenantId, deletedAt: null, ...consultationScope };

    // Get all consultations that have follow-up instructions
    const consultations = await prisma.consultation.findMany({
      where: { ...base, followUpInstructions: { not: "" } },
      orderBy: { consultationDate: "desc" },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, nhsNumber: true } },
        doctor: { select: { id: true, firstName: true, lastName: true } },
        clinic: { select: { id: true, name: true } },
      },
    });

    // Deduplicate — keep only the most recent consultation per patient
    const seen = new Set<string>();
    const followUps = consultations.filter((c) => {
      if (seen.has(c.patientId)) return false;
      seen.add(c.patientId);
      return true;
    });

    res.json(followUps.map((c) => ({
      patientId: c.patientId,
      patientName: `${c.patient?.firstName ?? ""} ${c.patient?.lastName ?? ""}`.trim(),
      nhsNumber: c.patient?.nhsNumber ?? "",
      followUpInstructions: c.followUpInstructions,
      consultationDate: c.consultationDate,
      doctorName: `${c.doctor?.firstName ?? ""} ${c.doctor?.lastName ?? ""}`.trim(),
      clinicName: c.clinic?.name ?? "",
    })));
  } catch (err) { next(err); }
});

// ── Clinic Stats ───────────────────────────────────────────────────────────────
// GET /api/reports/clinic-stats — patients, appointments, enrollments per clinic
router.get("/clinic-stats", async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const base = { tenantId, deletedAt: null };

    const [clinics, patientRows, apptRows, enrollRows] = await Promise.all([
      prisma.clinic.findMany({ where: base, select: { id: true, name: true, areaId: true, area: { select: { name: true } } } }),
      prisma.patient.groupBy({ by: ["clinicId"], where: base, _count: { id: true } }),
      prisma.appointment.groupBy({ by: ["clinicId"], where: base, _count: { id: true } }),
      prisma.programEnrollment.findMany({
        where: base,
        include: { patient: { select: { clinicId: true } } },
      }),
    ]);

    const patientMap = Object.fromEntries(patientRows.map(r => [r.clinicId, r._count.id]));
    const apptMap = Object.fromEntries(apptRows.map(r => [r.clinicId ?? "", r._count.id]));
    const enrollMap: Record<string, number> = {};
    for (const e of enrollRows) {
      const cid = e.patient?.clinicId ?? "";
      enrollMap[cid] = (enrollMap[cid] ?? 0) + 1;
    }

    res.json(clinics.map(c => ({
      clinicId: c.id,
      clinicName: c.name,
      areaName: c.area?.name ?? "",
      patientCount: patientMap[c.id] ?? 0,
      appointmentCount: apptMap[c.id] ?? 0,
      enrollmentCount: enrollMap[c.id] ?? 0,
    })).sort((a, b) => b.appointmentCount - a.appointmentCount));
  } catch (err) { next(err); }
});

// GET /api/reports/program-details/:programId — enrolled patients for drill-down
router.get("/program-details/:programId", async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const programId = req.params["programId"] as string;
    
    const roleScope = await getRoleScope(req, "patient");

    const [program, enrollments] = await Promise.all([
      prisma.program.findFirst({ where: { id: programId, tenantId, deletedAt: null }, select: { id: true, name: true } }),
      prisma.programEnrollment.findMany({
        where: { 
          tenantId, 
          programId, 
          deletedAt: null,
          patient: { ...roleScope } // Apply role scope to the patient relation
        },
        orderBy: { enrolledAt: "desc" },
        include: {
          patient: {
            select: {
              id: true, firstName: true, lastName: true, nhsNumber: true, status: true,
              clinic: { select: { id: true, name: true } },
              area: { select: { id: true, name: true } },
              doctorAssignments: {
                where: { deletedAt: null },
                take: 1,
                include: { doctor: { select: { id: true, firstName: true, lastName: true } } },
              },
            },
          },
        },
      }),
    ]);

    if (!program) { res.status(404).json({ error: "Program not found" }); return; }

    res.json({
      program,
      total: enrollments.length,
      active: enrollments.filter(e => e.status === "ACTIVE").length,
      completed: enrollments.filter(e => e.status === "COMPLETED").length,
      cancelled: enrollments.filter(e => e.status === "CANCELLED").length,
      enrollments: enrollments.map(e => ({
        enrollmentId: e.id,
        status: e.status,
        enrolledAt: e.enrolledAt,
        completedAt: e.completedAt,
        patientId: e.patient.id,
        patientName: `${e.patient.firstName} ${e.patient.lastName}`,
        nhsNumber: e.patient.nhsNumber,
        patientStatus: e.patient.status,
        clinicName: e.patient.clinic?.name ?? "",
        areaName: e.patient.area?.name ?? "",
        doctorName: e.patient.doctorAssignments[0]?.doctor
          ? `${e.patient.doctorAssignments[0].doctor.firstName} ${e.patient.doctorAssignments[0].doctor.lastName}`
          : "",
      })),
    });
  } catch (err) { next(err); }
});


// ── Outcome Reports ────────────────────────────────────────────────────────────

// GET /api/reports/outcomes-by-program
router.get("/outcomes-by-program", async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const base = { tenantId, deletedAt: null };
    const outcomes = await prisma.patientOutcome.findMany({
      where: base,
      include: { program: { select: { id: true, name: true } } },
    });
    const map: Record<string, { programName: string; total: number; improving: number }> = {};
    for (const o of outcomes) {
      const key = o.programId;
      if (!map[key]) map[key] = { programName: o.program?.name ?? "Unknown", total: 0, improving: 0 };
      map[key].total++;
      const isImproving = Math.abs(o.targetValue - o.baselineValue) > 0 &&
        Math.sign(o.targetValue - o.baselineValue) === Math.sign(o.currentValue - o.baselineValue);
      if (isImproving) map[key].improving++;
    }
    res.json(Object.entries(map).map(([programId, v]) => ({
      programId, programName: v.programName, total: v.total, improving: v.improving,
      successRate: v.total > 0 ? Math.round((v.improving / v.total) * 1000) / 10 : 0,
    })));
  } catch (err) { next(err); }
});

// GET /api/reports/outcomes-by-clinic
router.get("/outcomes-by-clinic", async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const roleScope = await getRoleScope(req, "clinic");
    
    // Build where clause with roleScope
    const clinicWhere = { tenantId, deletedAt: null, ...roleScope };

    const outcomes = await prisma.patientOutcome.findMany({
      where: { 
        tenantId, 
        deletedAt: null,
        patient: { clinic: clinicWhere }
      },
      include: { patient: { include: { clinic: { select: { id: true, name: true } } } } },
    });
    const map: Record<string, { clinicName: string; total: number; improving: number }> = {};
    for (const o of outcomes) {
      const clinicId = o.patient?.clinicId ?? "unknown";
      const clinicName = o.patient?.clinic?.name ?? "Unknown";
      if (!map[clinicId]) map[clinicId] = { clinicName, total: 0, improving: 0 };
      map[clinicId].total++;
      const isImproving = Math.abs(o.targetValue - o.baselineValue) > 0 &&
        Math.sign(o.targetValue - o.baselineValue) === Math.sign(o.currentValue - o.baselineValue);
      if (isImproving) map[clinicId].improving++;
    }
    res.json(Object.entries(map).map(([clinicId, v]) => ({
      clinicId, clinicName: v.clinicName, total: v.total, improving: v.improving,
      successRate: v.total > 0 ? Math.round((v.improving / v.total) * 1000) / 10 : 0,
    })));
  } catch (err) { next(err); }
});

// GET /api/reports/outcomes-by-doctor
router.get("/outcomes-by-doctor", async (req, res, next) => {
  try {
    const tenantId = req.tenantId;
    const outcomes = await prisma.patientOutcome.findMany({
      where: { tenantId, deletedAt: null, doctorId: { not: null } },
      include: { doctor: { select: { id: true, firstName: true, lastName: true } } },
    });
    const map: Record<string, { doctorName: string; total: number; improving: number }> = {};
    for (const o of outcomes) {
      const doctorId = o.doctorId ?? "none";
      const doctorName = o.doctor ? `${o.doctor.firstName} ${o.doctor.lastName}` : "Unassigned";
      if (!map[doctorId]) map[doctorId] = { doctorName, total: 0, improving: 0 };
      map[doctorId].total++;
      const isImproving = Math.abs(o.targetValue - o.baselineValue) > 0 &&
        Math.sign(o.targetValue - o.baselineValue) === Math.sign(o.currentValue - o.baselineValue);
      if (isImproving) map[doctorId].improving++;
    }
    res.json(Object.entries(map).map(([doctorId, v]) => ({
      doctorId, doctorName: v.doctorName, total: v.total, improving: v.improving,
      successRate: v.total > 0 ? Math.round((v.improving / v.total) * 1000) / 10 : 0,
    })));
  } catch (err) { next(err); }
});

export default router;
