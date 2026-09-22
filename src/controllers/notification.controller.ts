import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middlewares/auth";

export async function listNotifications(req: AuthRequest, res: Response) {
  const items = await prisma.notification.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: "desc" }
  });
  res.json({ success: true, data: items });
}

export async function markRead(req: AuthRequest, res: Response) {
  const item = await prisma.notification.updateMany({
    where: { id: req.params.id as string, userId: req.user!.userId },
    data: { isRead: true }
  });
  res.json({ success: true, data: { updated: item.count } });
}

export async function markAllRead(req: AuthRequest, res: Response) {
  await prisma.notification.updateMany({
    where: { userId: req.user!.userId, isRead: false },
    data: { isRead: true }
  });
  res.json({ success: true });
}
