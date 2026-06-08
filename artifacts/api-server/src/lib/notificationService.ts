import { prisma } from "./prisma.js";

type NotificationType = "INFO" | "WARNING" | "SUCCESS" | "ERROR";

interface NotifyParams {
  tenantId: string;
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
}

/**
 * Central notification helper. Called from route handlers at trigger points.
 * Never throws — notification failures must not break the main request flow.
 */
export async function notify(params: NotifyParams): Promise<void> {
  try {
    await prisma.notification.create({
      data: {
        tenantId: params.tenantId,
        userId: params.userId,
        title: params.title,
        message: params.message,
        type: params.type ?? "INFO",
      },
    });
  } catch {
    // Notification failures are non-fatal — log to console but do not throw
    console.warn("[NotificationService] Failed to create notification:", params.title);
  }
}

/**
 * Notify multiple users at once.
 */
export async function notifyMany(params: NotifyParams[]): Promise<void> {
  await Promise.allSettled(params.map(p => notify(p)));
}
