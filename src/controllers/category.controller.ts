import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export async function listCategories(req: Request, res: Response) {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: { children: true },
    orderBy: { name: "asc" }
  });
  res.json({ success: true, data: categories });
}
