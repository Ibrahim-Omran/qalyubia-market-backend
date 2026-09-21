import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("12345678", 12);

  await prisma.user.upsert({
    where: { email: "admin@qalyubiamarket.com" },
    update: {},
    create: {
      name: "Qalyubia Market Admin",
      email: "admin@qalyubiamarket.com",
      passwordHash,
      role: "ADMIN",
      isVerified: true
    }
  });

  const categories = [
    ["موبايلات", "mobiles"],
    ["سيارات", "cars"],
    ["عقارات", "real-estate"],
    ["أثاث", "furniture"],
    ["أجهزة منزلية", "home-appliances"],
    ["ملابس", "clothes"]
  ];

  for (const [name, slug] of categories) {
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug }
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
