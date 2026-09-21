import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middlewares/auth";

export async function stats(req: AuthRequest, res: Response) {
  const [
    totalUsers, totalAds, activeAds, pendingAds,
    totalPayments, successfulPayments
  ] = await Promise.all([
    prisma.user.count(),
    prisma.ad.count({ where: { status: { not: "DELETED" } } }),
    prisma.ad.count({ where: { status: "ACTIVE" } }),
    prisma.ad.count({ where: { status: "PENDING_PAYMENT" } }),
    prisma.payment.count(),
    prisma.payment.count({ where: { status: "SUCCESS" } })
  ]);

  const revenue = await prisma.payment.aggregate({
    where: { status: "SUCCESS" },
    _sum: { amount: true }
  });

  res.json({
    success: true,
    data: {
      totalUsers, totalAds, activeAds, pendingAds,
      totalPayments, successfulPayments,
      revenue: Number(revenue._sum.amount ?? 0)
    }
  });
}

export async function users(req: AuthRequest, res: Response) {
  const data = await prisma.user.findMany({
    select: { id: true, name: true, email: true, phone: true, role: true, isVerified: true, createdAt: true },
    orderBy: { createdAt: "desc" }
  });
  res.json({ success: true, data });
}

export async function ads(req: AuthRequest, res: Response) {
  const data = await prisma.ad.findMany({
    include: { images: true, user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" }
  });
  res.json({ success: true, data });
}

export async function approveAd(req: AuthRequest, res: Response) {
  const ad = await prisma.ad.update({
    where: { id: req.params.id },
    data: { status: "ACTIVE", publishedAt: new Date() }
  });
  res.json({ success: true, data: ad });
}

export async function rejectAd(req: AuthRequest, res: Response) {
  const ad = await prisma.ad.update({
    where: { id: req.params.id },
    data: { status: "REJECTED" }
  });
  res.json({ success: true, data: ad });
}
