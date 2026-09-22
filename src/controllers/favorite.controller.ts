import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middlewares/auth";

export async function addFavorite(req: AuthRequest, res: Response) {
  const ad = await prisma.ad.findUnique({ where: { id: req.params.adId as string } });
  if (!ad || ad.status !== "ACTIVE") return res.status(404).json({ success: false, message: "Ad not found" });

  const favorite = await prisma.favorite.upsert({
    where: { userId_adId: { userId: req.user!.userId, adId: ad.id } },
    create: { userId: req.user!.userId, adId: ad.id },
    update: {}
  });
  await prisma.ad.update({ where: { id: ad.id }, data: { favoritesCount: { increment: 1 } } }).catch(() => {});
  res.status(201).json({ success: true, data: favorite });
}

export async function removeFavorite(req: AuthRequest, res: Response) {
  const existing = await prisma.favorite.findUnique({
    where: { userId_adId: { userId: req.user!.userId, adId: req.params.adId as string } }
  });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    await prisma.ad.update({ where: { id: req.params.adId as string }, data: { favoritesCount: { decrement: 1 } } });
  }
  res.json({ success: true });
}

export async function listFavorites(req: AuthRequest, res: Response) {
  const items = await prisma.favorite.findMany({
    where: { userId: req.user!.userId },
    include: { ad: { include: { images: true, category: true } } },
    orderBy: { createdAt: "desc" }
  });
  res.json({ success: true, data: items.map(x => x.ad) });
}
