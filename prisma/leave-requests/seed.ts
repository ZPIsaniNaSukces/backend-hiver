import { PrismaClient } from "../../generated/prisma/leave-requests-client";

const prisma = new PrismaClient();

async function main() {
  console.warn("Start seeding leave-requests database ...");

  // Clear existing data and restart auto-incrementing identifiers
  await prisma.$executeRaw`TRUNCATE TABLE "LeaveRequest", "LeaveRequestUserInfo" RESTART IDENTITY CASCADE`;

  // Seed LeaveRequestUserInfo for users
  // Based on users seed: Alice (id: 1, companyId: 1), Martin (id: 2, companyId: 1, boss: Alice), Eve (id: 3, companyId: 2)
  await prisma.leaveRequestUserInfo.create({
    data: {
      id: 1, // Alice Admin
      bossId: null,
      companyId: 1, // Acme Corp
      availableLeaveDays: 20,
    },
  });

  await prisma.leaveRequestUserInfo.create({
    data: {
      id: 2, // Martin Manager
      bossId: 1, // Reports to Alice
      companyId: 1, // Acme Corp
      availableLeaveDays: 20,
    },
  });

  await prisma.leaveRequestUserInfo.create({
    data: {
      id: 3, // Eve Employee
      bossId: null,
      companyId: 2, // Globex
      availableLeaveDays: 20,
    },
  });

  // Seed some sample leave requests
  await prisma.leaveRequest.create({
    data: {
      userId: 2, // Martin
      startsAt: new Date("2025-12-20"),
      endsAt: new Date("2025-12-27"),
      reason: "Christmas vacation",
      status: "PENDING",
      approvedById: null,
    },
  });

  await prisma.leaveRequest.create({
    data: {
      userId: 3, // Eve
      startsAt: new Date("2025-11-15"),
      endsAt: new Date("2025-11-16"),
      reason: "Personal days",
      status: "APPROVED",
      approvedById: 1, // Approved by Alice (cross-company for demo)
    },
  });

  console.warn("Seeding leave-requests database finished.");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
