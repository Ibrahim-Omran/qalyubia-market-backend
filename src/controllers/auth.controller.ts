import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import { AuthRequest } from "../middlewares/auth";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  phone: z.string().min(8).optional(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1)
});

function safeUser(user: any) {
  const { passwordHash, ...rest } = user;
  return rest;
}

export async function register(req: Request, res: Response) {
  const data = registerSchema.parse(req.body);
  const exists = await prisma.user.findUnique({ where: { email: data.email } });
  if (exists) return res.status(409).json({ success: false, message: "Email already registered" });

  const passwordHash = await bcrypt.hash(data.password, 12);
  const user = await prisma.user.create({
    data: { name: data.name, email: data.email, phone: data.phone, passwordHash }
  });

  const payload = { userId: user.id, role: user.role };
  res.status(201).json({
    success: true,
    data: { user: safeUser(user), accessToken: signAccessToken(payload), refreshToken: signRefreshToken(payload) }
  });
}

export async function login(req: Request, res: Response) {
  const data = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
    return res.status(401).json({ success: false, message: "Invalid email or password" });
  }

  const payload = { userId: user.id, role: user.role };
  res.json({
    success: true,
    data: { user: safeUser(user), accessToken: signAccessToken(payload), refreshToken: signRefreshToken(payload) }
  });
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);
  try {
    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) return res.status(401).json({ success: false, message: "User not found" });
    const nextPayload = { userId: user.id, role: user.role };
    res.json({ success: true, data: { accessToken: signAccessToken(nextPayload) } });
  } catch {
    res.status(401).json({ success: false, message: "Invalid refresh token" });
  }
}

export async function me(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  res.json({ success: true, data: safeUser(user) });
}

export async function updateProfile(req: AuthRequest, res: Response) {
  const data = z.object({
    name: z.string().min(2).optional(),
    phone: z.string().min(8).nullable().optional(),
    avatarUrl: z.url().nullable().optional()
  }).parse(req.body);

  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data
  });
  res.json({ success: true, data: safeUser(user) });
}
