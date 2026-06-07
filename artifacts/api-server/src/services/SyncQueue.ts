import { prisma } from "../lib/prisma.js";
import { logger } from "../lib/logger.js";
import type { Prisma } from "@prisma/client";

export class SyncQueue {
  async enqueue(entityType: string, entityId: string, operation: string, payload: any) {
    try {
      const item = await prisma.syncQueueItem.create({
        data: {
          entityType,
          entityId,
          operation,
          payload: payload as Prisma.InputJsonValue,
          status: "PENDING",
        }
      });
      logger.info({ id: item.id, entityType, entityId }, "Enqueued sync task");
      return item;
    } catch (err) {
      logger.error({ err, entityType, entityId }, "Failed to enqueue sync task");
      throw err;
    }
  }

  async fetchPendingBatch(limit = 10) {
    return prisma.syncQueueItem.findMany({
      where: {
        status: { in: ["PENDING", "FAILED"] },
        retryCount: { lt: 3 }
      },
      orderBy: { createdAt: "asc" },
      take: limit,
    });
  }

  async markProcessing(id: string) {
    await prisma.syncQueueItem.update({
      where: { id },
      data: { status: "PROCESSING" }
    });
  }

  async markCompleted(id: string) {
    await prisma.syncQueueItem.update({
      where: { id },
      data: { status: "COMPLETED" }
    });
    // Optional: cleanup completed jobs if desired
  }

  async markFailed(id: string, error: string, currentRetryCount: number, payload: any, entityType: string, entityId: string, operation: string) {
    const nextRetry = currentRetryCount + 1;
    if (nextRetry >= 3) {
      // Move to DLQ
      await prisma.$transaction([
        prisma.deadLetterQueueItem.create({
          data: {
            entityType,
            entityId,
            operation,
            payload,
            retryCount: nextRetry,
            error: error.substring(0, 1000)
          }
        }),
        prisma.syncQueueItem.delete({ where: { id } })
      ]);
      logger.error({ id, entityType, entityId }, "Sync task permanently failed, moved to DLQ");
    } else {
      await prisma.syncQueueItem.update({
        where: { id },
        data: {
          status: "FAILED",
          retryCount: nextRetry,
          error: error.substring(0, 1000)
        }
      });
      logger.warn({ id, nextRetry, error }, "Sync task failed, queued for retry");
    }
  }
}
