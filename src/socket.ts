import { Server } from "socket.io";
import { verifyAccessToken } from "./utils/jwt";
import { prisma } from "./lib/prisma";

export function configureSocket(io: Server) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Authentication required"));
      (socket as any).user = verifyAccessToken(token);
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", socket => {
    const userId = (socket as any).user.userId;

    socket.join(`user:${userId}`);

    socket.on("conversation:join", async (conversationId: string) => {
      const conversation = await prisma.conversation.findFirst({
        where: { id: conversationId, OR: [{ buyerId: userId }, { sellerId: userId }] }
      });
      if (conversation) socket.join(`conversation:${conversationId}`);
    });

    socket.on("message:send", async (payload: { conversationId: string; content: string }) => {
      const conversation = await prisma.conversation.findFirst({
        where: { id: payload.conversationId, OR: [{ buyerId: userId }, { sellerId: userId }] }
      });
      if (!conversation || !payload.content?.trim()) return;

      const message = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: userId,
          content: payload.content.trim()
        }
      });

      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { updatedAt: new Date() }
      });

      io.to(`conversation:${conversation.id}`).emit("message:new", message);
    });

    socket.on("message:read", async (messageId: string) => {
      await prisma.message.updateMany({
        where: { id: messageId, conversation: { OR: [{ buyerId: userId }, { sellerId: userId }] } },
        data: { isRead: true }
      });
    });

    socket.on("typing:start", (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit("typing:start", { userId });
    });

    socket.on("typing:stop", (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit("typing:stop", { userId });
    });
  });
}
