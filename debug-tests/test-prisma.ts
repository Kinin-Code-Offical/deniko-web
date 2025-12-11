import { db } from "../lib/db";

async function main() {
  console.log("Testing Prisma Connection...");
  try {
    const userCount = await db.user.count();
    console.log("User count:", userCount);
    console.log("Prisma Connection Successful!");
  } catch (error) {
    console.error("Prisma Connection Failed:", error);
  } finally {
    await db.$disconnect();
  }
}

main();
