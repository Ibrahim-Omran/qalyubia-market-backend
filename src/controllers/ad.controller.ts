import { Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middlewares/auth";
import { env } from "../config/env";

const adSchema = z.object({
  title: z.string().min(3).max(150),
  description: z.string().min(5).max(5000),
  price: z.coerce.number().nonnegative(),
  categoryId: z.string().uuid(),
  subcategoryId: z.string().uuid().nullable().optional(),
  condition: z.enum(["NEW", "USED"]),
  location: z.string().min(2),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional()
});

export async function createAd(req: AuthRequest, res: Response) {
  const data = adSchema.parse(req.body);
  const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
  if (!category) return res.status(400).json({ success: false, message: "Category not found" });

  const ad = await prisma.ad.create({
    data: {
      ...data,
      userId: req.user!.userId,
      status: "PENDING_PAYMENT"
    }
  });

  res.status(201).json({
    success: true,
    message: `Ad created. Payment of ${env.publishingFee} EGP is required before publishing.`,
    data: ad
  });
}

export async function listAds(req: AuthRequest, res: Response) {
  const {
    search, categoryId, subcategoryId, minPrice, maxPrice, condition,
    location, sort = "latest", page = "1", limit = "20"
  } = req.query as Record<string, string>;

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));

  const where: any = { status: "ACTIVE" };
  if (categoryId) where.categoryId = categoryId;
  if (subcategoryId) where.subcategoryId = subcategoryId;
  if (condition) where.condition = condition;
  if (location) where.location = { contains: location, mode: "insensitive" };
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } }
    ];
  }

  const orderBy: any =
    sort === "price_asc" ? { price: "asc" } :
    sort === "price_desc" ? { price: "desc" } :
    sort === "most_viewed" ? { viewsCount: "desc" } :
    sort === "oldest" ? { createdAt: "asc" } :
    { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.ad.findMany({
      where, orderBy,
      skip: (pageNum - 1) * limitNum,
      take: limitNum,
      include: { images: true, category: true, user: { select: { id: true, name: true, avatarUrl: true } } }
    }),
    prisma.ad.count({ where })
  ]);

  res.json({
    success: true,
    data: items,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) }
  });
}

export async function getAd(req: AuthRequest, res: Response) {
  const ad = await prisma.ad.findUnique({
    where: { id: req.params.id },
    include: { images: true, category: true, user: { select: { id: true, name: true, avatarUrl: true } } }
  });
  if (!ad || ad.status === "DELETED") return res.status(404).json({ success: false, message: "Ad not found" });

  await prisma.ad.update({ where: { id: ad.id }, data: { viewsCount: { increment: 1 } } });
  res.json({ success: true, data: ad });
}

export async function myAds(req: AuthRequest, res: Response) {
  const ads = await prisma.ad.findMany({
    where: { userId: req.user!.userId, status: { not: "DELETED" } },
    include: { images: true, category: true },
    orderBy: { createdAt: "desc" }
  });
  res.json({ success: true, data: ads });
}

export async function updateAd(req: AuthRequest, res: Response) {
  const data = adSchema.partial().parse(req.body);
  const ad = await prisma.ad.findFirst({ where: { id: req.params.id, userId: req.user!.userId } });
  if (!ad) return res.status(404).json({ success: false, message: "Ad not found" });
  if (ad.status === "ACTIVE") return res.status(400).json({ success: false, message: "Active ads cannot be edited in this starter API" });

  const updated = await prisma.ad.update({ where: { id: ad.id }, data });
  res.json({ success: true, data: updated });
}

export async function deleteAd(req: AuthRequest, res: Response) {
  const ad = await prisma.ad.findFirst({ where: { id: req.params.id, userId: req.user!.userId } });
  if (!ad) return res.status(404).json({ success: false, message: "Ad not found" });
  const updated = await prisma.ad.update({ where: { id: ad.id }, data: { status: "DELETED" } });
  res.json({ success: true, data: updated });
}

export async function markSold(req: AuthRequest, res: Response) {
  const ad = await prisma.ad.findFirst({ where: { id: req.params.id, userId: req.user!.userId } });
  if (!ad) return res.status(404).json({ success: false, message: "Ad not found" });
  const updated = await prisma.ad.update({ where: { id: ad.id }, data: { status: "SOLD" } });
  res.json({ success: true, data: updated });
}
