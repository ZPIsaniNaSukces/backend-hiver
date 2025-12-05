import { faker } from "@faker-js/faker/locale/pl";

import type { Prisma } from "../../generated/prisma/requests-client";
import { PrismaClient } from "../../generated/prisma/requests-client";
import { buildSeedUsers } from "../shared/seed-data";

const prisma = new PrismaClient();

async function main() {
  console.warn("Start seeding requests database ...");

  // Clear existing data and restart auto-incrementing identifiers
  await prisma.$executeRaw`TRUNCATE TABLE "AvailabilityRequest", "GeneralRequest", "RequestUserInfo" RESTART IDENTITY CASCADE`;

  const users = buildSeedUsers();

  // Seed RequestUserInfo for users
  await prisma.requestUserInfo.createMany({
    data: users.map((u) => ({
      id: u.id,
      bossId: u.bossId,
      companyId: u.companyId,
      availableLeaveHours: u.availableLeaveHours,
      name: u.name,
      lastName: u.surname,
      title: u.title,
    })),
  });

  // Seed some sample availability requests
  const availabilityRequests: Prisma.AvailabilityRequestCreateManyInput[] = [];
  for (const user of users) {
    // Randomly create 0-3 requests per user
    const numberRequests = faker.number.int({ min: 0, max: 3 });
    for (let index = 0; index < numberRequests; index++) {
      const status = faker.helpers.arrayElement([
        "PENDING",
        "APPROVED",
        "REJECTED",
      ]);
      const approvedById =
        status === "APPROVED" || status === "REJECTED" ? user.bossId : null;

      availabilityRequests.push({
        userId: user.id,
        date: faker.date.future(),
        hours: faker.number.int({ min: 4, max: 8 }),
        type: faker.helpers.arrayElement([
          "VACATION",
          "ONLINE_WORK",
          "OFFLINE_WORK",
        ]),
        status,
        approvedById,
        // eslint-disable-next-line unicorn/no-negated-condition
        acceptedRejectedAt: status !== "PENDING" ? new Date() : null,
      });
    }
  }

  await prisma.availabilityRequest.createMany({
    data: availabilityRequests,
  });

  // Seed a sample general request
  const generalRequests: Prisma.GeneralRequestCreateManyInput[] = [];
  for (const user of users) {
    if (faker.datatype.boolean()) {
      generalRequests.push({
        userId: user.id,
        description: faker.lorem.sentence(),
        status: faker.helpers.arrayElement(["PENDING", "APPROVED", "REJECTED"]),
      });
    }
  }

  await prisma.generalRequest.createMany({
    data: generalRequests,
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
