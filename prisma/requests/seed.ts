import { PrismaClient } from "../../generated/prisma/requests-client";

const prisma = new PrismaClient();

async function main() {
  console.warn("Start seeding requests database ...");

  // Clear existing data and restart auto-incrementing identifiers
  await prisma.$executeRaw`TRUNCATE TABLE "AvailabilityRequest", "GeneralRequest", "RequestUserInfo" RESTART IDENTITY CASCADE`;

  // Seed RequestUserInfo for users
  // Based on users seed: Alice (id: 1, companyId: 1), Martin (id: 2, companyId: 1, boss: Alice), Eve (id: 3, companyId: 2)
  await prisma.requestUserInfo.create({
    data: {
      id: 1, // Alice Admin
      bossId: null,
      companyId: 1, // Acme Corp
      availableLeaveHours: 160,
    },
  });

  await prisma.requestUserInfo.create({
    data: {
      id: 2, // Martin Manager
      bossId: 1, // Reports to Alice
      companyId: 1, // Acme Corp
      availableLeaveHours: 160,
    },
  });

  await prisma.requestUserInfo.create({
    data: {
      id: 3, // Eve Employee
      bossId: null,
      companyId: 2, // Globex
      availableLeaveHours: 160,
    },
  });

  // Seed some sample availability requests
  await prisma.availabilityRequest.create({
    data: {
      userId: 2, // Martin
      date: new Date("2025-12-20"),
      hours: 8,
      type: "VACATION",
      status: "PENDING",
    },
  });

  await prisma.availabilityRequest.create({
    data: {
      userId: 3, // Eve
      date: new Date("2025-11-15"),
      hours: 8,
      type: "VACATION",
      status: "APPROVED",
      approvedById: 1, // Approved by Alice
      acceptedRejectedAt: new Date(),
    },
  });

  // Seed a sample general request
  await prisma.generalRequest.create({
    data: {
      userId: 2, // Martin
      description: "Need a new keyboard",
      status: "PENDING",
    },
  });

  console.warn("Seeding requests database finished.");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
