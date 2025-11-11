
import { PrismaClient } from "../generated/prisma";

// export const prisma = new PrismaClient({
//   log: ["query"],
// });
// lib/db.ts
// import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };
console.log(`globalForPrisma: ${globalForPrisma}`);

let prismaInstance: PrismaClient;

try {
  prismaInstance = globalForPrisma.prisma || new PrismaClient({
    log: ["query"],
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prismaInstance;
  }

} catch (error) {
  console.error("PrismaClient の初期化に失敗しました:", error);
  // ここで例外を再スローするか、空のダミーオブジェクトにするか選択できます
  throw error;
}

export const prisma = prismaInstance;