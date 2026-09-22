import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middlewares/auth";
import { env } from "../config/env";

/*
  Payment provider abstraction.
  The exact Paymob API flow/credentials can change, so keep provider-specific
  HTTP code isolated here. Never trust amount/status coming from Flutter.
*/

export async function createPayment(req: AuthRequest, res: Response) {
  const { adId } = z.object({ adId: z.string().uuid() }).parse(req.body);

  const ad = await prisma.ad.findFirst({
    where: { id: adId, userId: req.user!.userId }
  });
  if (!ad) return res.status(404).json({ success: false, message: "Ad not found" });

  if (!["PENDING_PAYMENT", "DRAFT"].includes(ad.status)) {
    return res.status(400).json({ success: false, message: "Ad is not awaiting payment" });
  }

  const payment = await prisma.payment.create({
    data: {
      userId: req.user!.userId,
      adId,
      amount: env.publishingFee,
      currency: "EGP",
      provider: "PAYMOB",
      status: "PENDING"
    }
  });

  await prisma.ad.update({
    where: { id: ad.id },
    data: { status: "PENDING_PAYMENT" }
  });

  res.status(201).json({
    success: true,
    message: "Payment created",
    data: {
      paymentId: payment.id,
      amount: Number(payment.amount),
      currency: payment.currency,
      provider: payment.provider,
      status: payment.status,
      note: "Connect this payment to the Paymob checkout flow in the provider adapter."
    }
  });
}

export async function getPayment(req: AuthRequest, res: Response) {
  const payment = await prisma.payment.findFirst({
    where: { id: req.params.id as string, userId: req.user!.userId }
  });
  if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
  res.json({ success: true, data: payment });
}

/*
  Production rule:
  Paymob must call this webhook after payment.
  Verify the webhook signature/HMAC and transaction server-side before changing
  payment/ad status. This starter deliberately does not accept a Flutter-side
  "success" flag.
*/
export async function paymobWebhook(req: any, res: Response) {
  const body = req.body;

  // TODO: verify Paymob HMAC/signature according to the currently configured
  // Paymob integration before processing the payload.
  const paymentId = body?.paymentId ?? body?.merchant_order_id;
  const providerTransactionId = body?.id ? String(body.id) : undefined;
  const success = body?.success === true || body?.success === "true";

  if (!paymentId) return res.status(400).json({ success: false, message: "Missing payment reference" });

  const payment = await prisma.payment.findFirst({
    where: providerTransactionId
      ? { OR: [{ id: paymentId }, { providerTransactionId }] }
      : { id: paymentId }
  });
  if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });

  if (payment.status === "SUCCESS") return res.json({ success: true, message: "Already processed" });

  await prisma.$transaction(async tx => {
    const nextStatus = success ? "SUCCESS" : "FAILED";

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: nextStatus,
        providerTransactionId,
        rawWebhook: body
      }
    });

    if (success) {
      await tx.ad.update({
        where: { id: payment.adId },
        data: { status: "ACTIVE", publishedAt: new Date() }
      });

      await tx.notification.create({
        data: {
          userId: payment.userId,
          type: "PAYMENT_SUCCESS",
          title: "تم تأكيد الدفع",
          body: "تم تأكيد رسوم نشر الإعلان ونشر إعلانك."
        }
      });
    } else {
      await tx.notification.create({
        data: {
          userId: payment.userId,
          type: "PAYMENT_FAILED",
          title: "فشل الدفع",
          body: "لم يتم تأكيد عملية الدفع."
        }
      });
    }
  });

  res.json({ success: true });
}
