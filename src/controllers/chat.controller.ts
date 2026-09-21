import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../middlewares/auth";

export async function listConversations(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const items = await prisma.conversation.findMany({
    where: { OR: [{ buyerId: userId }, { sellerId: userId }] },
    include: {
      ad: { include: { images: true } },
      buyer: { select: { id: true, name: true, avatarUrl: true } },
      seller: { select: { id: true, name: true, avatarUrl: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 }
    },
    orderBy: { updatedAt: "desc" }
  });
  res.json({ success: true, data: items });
}

export async function createConversation(req: AuthRequest, res: Response) {
  const { adId } = req.body;
  const ad = await prisma.ad.findUnique({ where: { id: adId } });
  if (!ad || ad.status !== "ACTIVE") return res.status(404).json({ success: false, message: "Ad not found" });
  if (ad.userId === req.user!.userId) return res.status(400).json({ success: false, message: "Cannot chat with yourself" });

  const conversation = await prisma.conversation.upsert({
    where: { adId_buyerId_sellerId: { adId, buyerId: req.user!.userId, sellerId: ad.userId } },
    create: { adId, buyerId: req.user!.userId, sellerId: ad.userId },
    update: {}
  });
  res.status(201).json({ success: true, data: conversation });
}

export async function listMessages(req: AuthRequest, res: Response) {
  const conversation = await prisma.conversation.findFirst({
    where: { id: req.params.id, OR: [{ buyerId: req.user!.userId }, { sellerId: req.user!.userId }] }
  });
  if (!conversation) return res.status(404).json({ success: false, message: "Conversation not found" });

  const messages = await prisma.message.findMany({
    where: { conversationId: conversation.id },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { id: true, name: true, avatarUrl: true } } }
  });
  res.json({ success: true, data: messages });
}
