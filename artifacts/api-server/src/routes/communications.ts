import { Router } from "express";
import { z } from "zod";
import twilio from "twilio";
import { prisma } from "../lib/prisma.js";
import { authenticate } from "../middlewares/auth.js";
import { CLINICAL_ROLES } from "../middlewares/rbac.js";
import { requireTenant } from "../middlewares/tenantScope.js";
import { validateBody } from "../middlewares/validate.js";
import { Errors, paginate, paginationMeta } from "../types/index.js";

const router = Router();

const SendSmsSchema = z.object({
  patientIds: z.array(z.string().uuid()).min(1),
  message: z.string().min(1).max(1600),
});

// Initialize Twilio client using environment variables. 
// If not present, we can just log a warning and proceed without throwing so dev mode works.
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;
const twilioFromNumber = process.env.TWILIO_FROM_NUMBER || "+15555555555";

router.get("/", authenticate, requireTenant, CLINICAL_ROLES, async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query);
    const { patientId, status } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { tenantId: req.tenantId! };
    if (patientId) where["patientId"] = patientId;
    if (status) where["status"] = status;

    const [total, comms] = await Promise.all([
      prisma.smsCommunication.count({ where }),
      prisma.smsCommunication.findMany({
        where, skip, take, orderBy: { createdAt: "desc" },
        include: { patient: { select: { id: true, firstName: true, lastName: true, nhsNumber: true } } },
      }),
    ]);
    res.json({ data: comms, meta: paginationMeta(total, page, limit) });
  } catch (err) { next(err); }
});

router.post("/", authenticate, requireTenant, CLINICAL_ROLES, async (req, res, next) => {
  try {
    const { patientId, type, subject, body: msgBody } = req.body as { patientId: string; type: string; subject: string; body?: string };
    if (!patientId) throw Errors.validation("patientId is required");

    const patient = await prisma.patient.findFirst({
      where: { id: patientId, tenantId: req.tenantId!, deletedAt: null },
      select: { id: true, mobile: true, optOut: true },
    });
    if (!patient) throw Errors.notFound("Patient");

    const message = msgBody || subject || "";
    let record = await prisma.smsCommunication.create({
      data: {
        tenantId: req.tenantId!,
        patientId: patient.id,
        mobile: patient.mobile,
        messageText: message,
        status: "QUEUED",
      },
    });

    if (twilioClient && patient.mobile && !patient.optOut) {
      try {
        const twilioMsg = await twilioClient.messages.create({
          body: message,
          from: twilioFromNumber,
          to: patient.mobile,
        });
        record = await prisma.smsCommunication.update({
          where: { id: record.id },
          data: { twilioSid: twilioMsg.sid, status: "SENT", sentAt: new Date() },
        });
      } catch (_) {
        await prisma.smsCommunication.update({ where: { id: record.id }, data: { status: "FAILED" } });
      }
    }

    res.status(201).json(record);
  } catch (err) { next(err); }
});

router.get("/:id", authenticate, requireTenant, CLINICAL_ROLES, async (req, res, next) => {
  try {
    const comm = await prisma.smsCommunication.findFirst({
      where: { id: req.params["id"] as string, tenantId: req.tenantId! },
      include: { patient: { select: { id: true, firstName: true, lastName: true } } },
    });
    if (!comm) throw Errors.notFound("Communication");
    res.json(comm);
  } catch (err) { next(err); }
});

router.delete("/:id", authenticate, requireTenant, CLINICAL_ROLES, async (req, res, next) => {
  try {
    const comm = await prisma.smsCommunication.findFirst({
      where: { id: req.params["id"] as string, tenantId: req.tenantId! },
    });
    if (!comm) throw Errors.notFound("Communication");
    // SMS messages aren't truly deleted — we mark them CANCELLED
    await prisma.smsCommunication.update({ where: { id: comm.id }, data: { status: "CANCELLED" as never } });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ── Legacy /sms sub-routes (kept for backwards compatibility) ─────────────────
router.get("/sms", authenticate, requireTenant, CLINICAL_ROLES, async (req, res, next) => {
  try {
    const { skip, take, page, limit } = paginate(req.query);
    const { patientId, status } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { tenantId: req.tenantId! };
    if (patientId) where["patientId"] = patientId;
    if (status) where["status"] = status;

    const [total, comms] = await Promise.all([
      prisma.smsCommunication.count({ where }),
      prisma.smsCommunication.findMany({
        where, skip, take, orderBy: { createdAt: "desc" },
        include: { patient: { select: { id: true, firstName: true, lastName: true, nhsNumber: true } } },
      }),
    ]);
    res.json({ data: comms, meta: paginationMeta(total, page, limit) });
  } catch (err) { next(err); }
});

router.post("/sms", authenticate, requireTenant, CLINICAL_ROLES, validateBody(SendSmsSchema), async (req, res, next) => {
  try {
    const { patientIds, message } = req.body as z.infer<typeof SendSmsSchema>;

    const patients = await prisma.patient.findMany({
      where: { id: { in: patientIds }, tenantId: req.tenantId!, deletedAt: null, optOut: false },
      select: { id: true, mobile: true },
    });

    if (patients.length === 0) throw Errors.validation("No valid patients found (check opt-out status)");

    const records = [];
    
    // Process each patient individually so we can try to send via Twilio
    for (const p of patients) {
      // Create DB record first as QUEUED
      let record = await prisma.smsCommunication.create({
        data: {
          tenantId: req.tenantId!,
          patientId: p.id,
          mobile: p.mobile,
          messageText: message,
          status: "QUEUED",
        },
      });

      // Attempt to send via Twilio if client is configured
      if (twilioClient && p.mobile) {
        try {
          const twilioMsg = await twilioClient.messages.create({
            body: message,
            from: twilioFromNumber,
            to: p.mobile,
          });

          // Update record with Twilio SID and sent status
          record = await prisma.smsCommunication.update({
            where: { id: record.id },
            data: {
              twilioSid: twilioMsg.sid,
              status: "SENT",
              sentAt: new Date(),
            },
          });
        } catch (twilioErr: any) {
          // Update record as failed if Twilio rejects it
          record = await prisma.smsCommunication.update({
            where: { id: record.id },
            data: {
              status: "FAILED",
            },
          });
        }
      }
      
      records.push(record);
    }

    res.status(201).json(records);
  } catch (err) { next(err); }
});

router.get("/sms/:id", authenticate, requireTenant, CLINICAL_ROLES, async (req, res, next) => {
  try {
    const comm = await prisma.smsCommunication.findFirst({
      where: { id: req.params["id"] as string, tenantId: req.tenantId! },
      include: { patient: { select: { id: true, firstName: true, lastName: true } } },
    });
    if (!comm) throw Errors.notFound("SMS record");
    res.json(comm);
  } catch (err) { next(err); }
});

// Twilio delivery status webhook (no auth)
router.post("/sms/webhook", async (req, res, next) => {
  try {
    const { MessageSid, MessageStatus } = req.body as { MessageSid?: string; MessageStatus?: string };
    if (!MessageSid || !MessageStatus) { res.status(200).send(); return; }

    const statusMap: Record<string, string> = {
      queued: "QUEUED", sent: "SENT", delivered: "DELIVERED",
      failed: "FAILED", undelivered: "UNDELIVERED",
    };
    const mappedStatus = statusMap[MessageStatus.toLowerCase()];
    if (mappedStatus) {
      await prisma.smsCommunication.updateMany({
        where: { twilioSid: MessageSid },
        data: {
          status: mappedStatus as never,
          ...(mappedStatus === "DELIVERED" ? { deliveredAt: new Date() } : {}),
          ...(mappedStatus === "SENT" ? { sentAt: new Date() } : {}),
        },
      });
    }
    res.status(200).send();
  } catch (err) { next(err); }
});

export default router;
