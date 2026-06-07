import { Router, type IRouter } from "express";
import { prisma } from "../lib/prisma.js";
import { mysqlPool } from "../lib/mysql.js";

const router: IRouter = Router();

router.get("/postgres", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", connectivity: "connected", timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(503).json({ status: "error", connectivity: "disconnected", error: err.message, timestamp: new Date().toISOString() });
  }
});

router.get("/mysql", async (_req, res) => {
  try {
    await mysqlPool.execute('SELECT 1');
    res.json({ status: "ok", connectivity: "connected", timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(503).json({ status: "error", connectivity: "disconnected", error: err.message, timestamp: new Date().toISOString() });
  }
});

router.get("/database-sync", async (_req, res) => {
  try {
    const lastSync = await prisma.databaseSyncAudit.findFirst({
      orderBy: { createdAt: "desc" }
    });
    const failureCount = await prisma.databaseSyncAudit.count({
      where: { mysqlStatus: "FAILED" }
    });
    // Pending sync count might be the ones in Queued status, but currently we do retries synchronously or let it fail permanently.
    // If we had an async queue we could count it. We'll return 0 for now or whatever is relevant.
    res.json({
      status: "ok",
      lastSyncStatus: lastSync ? lastSync.mysqlStatus : "UNKNOWN",
      lastSyncTime: lastSync ? lastSync.createdAt : null,
      pendingSyncCount: 0,
      failureCount,
    });
  } catch (err: any) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

router.get("/database-metrics", async (_req, res) => {
  try {
    const totalJobs = await prisma.syncQueueItem.count();
    const pendingJobs = await prisma.syncQueueItem.count({ where: { status: "PENDING" } });
    const failedJobs = await prisma.syncQueueItem.count({ where: { status: "FAILED" } });
    const completedJobs = await prisma.syncQueueItem.count({ where: { status: "COMPLETED" } });
    const deadLetterCount = await prisma.deadLetterQueueItem.count();
    
    let successRate = "100%";
    if (totalJobs > 0) {
      successRate = ((completedJobs / totalJobs) * 100).toFixed(1) + "%";
    }

    res.json({
      successRate,
      pendingJobs,
      failedJobs,
      queueDepth: pendingJobs + failedJobs,
      deadLetterCount,
      avgLatencyMs: 0 // Mocked for now, can be calculated using createdAt vs updatedAt
    });
  } catch (err: any) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

// Keep original for backward compatibility if any
router.get("/healthz", async (_req, res) => {
  res.redirect("/api/health/postgres");
});

export default router;
