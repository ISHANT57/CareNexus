import { prisma } from "../lib/prisma.js";

// ── Risk Factor Weights ───────────────────────────────────────────────────────
// Documented weights per spec (Phase 5):
//   Missed Appointment (last 30d)   : +10
//   Overdue Care Task               : +15 (each, max 3)
//   No Consultation in 60+ days     : +20
//   No Outcome Improvement          : +25
//   Program Non-Compliance          : +20
// Max score = 100 → CRITICAL

const WEIGHTS = {
  MISSED_APPOINTMENT: 10,
  OVERDUE_TASK: 15,
  MAX_OVERDUE_TASK_PENALTY: 45, // 3 × 15
  NO_RECENT_CONSULT: 20,
  NO_OUTCOME_IMPROVEMENT: 25,
  PROGRAM_NON_COMPLIANCE: 20,
};

function scoreToLevel(score: number): "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" {
  if (score >= 75) return "CRITICAL";
  if (score >= 50) return "HIGH";
  if (score >= 25) return "MEDIUM";
  return "LOW";
}

export async function calculateRiskScore(patientId: string, tenantId: string): Promise<{
  score: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  factors: Record<string, number>;
}> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const [missedAppointments, overdueTasks, recentConsultation, outcomes, activeEnrollments] =
    await Promise.all([
      // Missed appointments in last 30 days
      prisma.appointment.count({
        where: { patientId, tenantId, status: "NO_SHOW", appointmentDate: { gte: thirtyDaysAgo }, deletedAt: null },
      }),
      // Overdue tasks
      prisma.careTask.count({
        where: { patientId, tenantId, deletedAt: null, status: { in: ["PENDING", "IN_PROGRESS"] }, dueDate: { lt: now } },
      }),
      // Most recent consultation
      prisma.consultation.findFirst({
        where: { patientId, tenantId, deletedAt: null },
        orderBy: { consultationDate: "desc" },
        select: { consultationDate: true },
      }),
      // Outcomes
      prisma.patientOutcome.findMany({
        where: { patientId, tenantId, deletedAt: null },
        select: { baselineValue: true, currentValue: true, targetValue: true },
      }),
      // Active enrollments
      prisma.programEnrollment.count({
        where: { patientId, tenantId, status: "ACTIVE", deletedAt: null },
      }),
    ]);

  const factors: Record<string, number> = {};
  let score = 0;

  // Missed appointment penalty
  if (missedAppointments > 0) {
    factors["missedAppointment"] = WEIGHTS.MISSED_APPOINTMENT;
    score += WEIGHTS.MISSED_APPOINTMENT;
  }

  // Overdue task penalty (capped)
  if (overdueTasks > 0) {
    const penalty = Math.min(overdueTasks * WEIGHTS.OVERDUE_TASK, WEIGHTS.MAX_OVERDUE_TASK_PENALTY);
    factors["overdueTasks"] = penalty;
    score += penalty;
  }

  // No recent consultation
  const lastConsultDate = recentConsultation?.consultationDate;
  if (!lastConsultDate || new Date(lastConsultDate) < sixtyDaysAgo) {
    factors["noRecentConsultation"] = WEIGHTS.NO_RECENT_CONSULT;
    score += WEIGHTS.NO_RECENT_CONSULT;
  }

  // No outcome improvement
  if (outcomes.length > 0) {
    const improvingOutcomes = outcomes.filter(o => {
      const range = o.targetValue - o.baselineValue;
      if (range === 0) return false;
      return Math.sign(range) === Math.sign(o.currentValue - o.baselineValue);
    });
    if (improvingOutcomes.length === 0) {
      factors["noOutcomeImprovement"] = WEIGHTS.NO_OUTCOME_IMPROVEMENT;
      score += WEIGHTS.NO_OUTCOME_IMPROVEMENT;
    }
  }

  // Program non-compliance
  if (activeEnrollments === 0) {
    factors["programNonCompliance"] = WEIGHTS.PROGRAM_NON_COMPLIANCE;
    score += WEIGHTS.PROGRAM_NON_COMPLIANCE;
  }

  score = Math.min(score, 100);
  const riskLevel = scoreToLevel(score);

  return { score, riskLevel, factors };
}

export async function calculateAndPersistRisk(patientId: string, tenantId: string): Promise<void> {
  const { score, riskLevel } = await calculateRiskScore(patientId, tenantId);
  // Scope the write by tenant so a mismatched patientId can never touch another tenant's row.
  await prisma.patient.updateMany({
    where: { id: patientId, tenantId },
    data: { riskScore: score, riskLevel, lastCalculatedAt: new Date() },
  });
}

export async function calculateAllPatientRisks(tenantId: string): Promise<{ processed: number; errors: number }> {
  const patients = await prisma.patient.findMany({
    where: { tenantId, deletedAt: null },
    select: { id: true },
  });

  let errors = 0;
  for (const p of patients) {
    try {
      await calculateAndPersistRisk(p.id, tenantId);
    } catch {
      errors++;
    }
  }
  return { processed: patients.length - errors, errors };
}
