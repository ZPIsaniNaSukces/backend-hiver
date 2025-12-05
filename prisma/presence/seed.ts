import { faker } from "@faker-js/faker/locale/pl";

import { PrismaClient } from "../../generated/prisma/presence-client";
import type {
  CheckinDirection,
  CheckinType,
  NfcTag,
  Prisma,
} from "../../generated/prisma/presence-client";
import { buildSeedUsers, seedCompanies } from "../shared/seed-data";

const prisma = new PrismaClient();

async function main() {
  console.warn("Start seeding presence database ...");

  // Clear existing data and restart auto-incrementing identifiers
  await prisma.$executeRaw`TRUNCATE TABLE "Checkin", "CheckinUserInfo", "NfcTag" RESTART IDENTITY CASCADE`;

  // Seed NFC Tags for companies
  const tags: NfcTag[] = [];
  for (const company of seedCompanies) {
    const tag = await prisma.nfcTag.create({
      data: {
        uid: faker.string.hexadecimal({ length: 14, prefix: "" }).toUpperCase(),
        name: `${company.name} Main Entrance`,
        companyId: company.id,
        aesKey: faker.string.alphanumeric(32),
      },
    });
    tags.push(tag);

    // Add "Biuro Elka Żelka" tag to all companies
    // Use specific UID for Company 2 (Globex) as requested, random for others to satisfy unique constraint
    const isTargetCompany = company.id === 1;
    const elkaTag = await prisma.nfcTag.create({
      data: {
        uid: isTargetCompany
          ? "042C6632A91190"
          : faker.string.hexadecimal({ length: 14, prefix: "" }).toUpperCase(),
        name: "Biuro Elka Żelka",
        companyId: company.id,
        aesKey: isTargetCompany
          ? "globex-secret-key-042C6632A91190"
          : faker.string.alphanumeric(32),
      },
    });
    tags.push(elkaTag);
  }

  const users = buildSeedUsers();

  // Seed CheckinUserInfo for users
  for (const u of users) {
    await prisma.checkinUserInfo.create({
      data: {
        userId: u.id,
        bossId: u.bossId,
        companyId: u.companyId,
      },
    });
  }

  // Seed some sample checkins
  const checkinsData: Prisma.CheckinCreateManyInput[] = [];
  const today = new Date();

  for (const user of users) {
    const companyTag = tags.find((t) => t.companyId === user.companyId);
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!companyTag) {
      continue;
    }

    // Generate checkins for the last 7 days
    for (let index = 0; index < 7; index++) {
      const date = new Date(today);
      date.setDate(date.getDate() - index);

      // Skip weekends randomly
      if (
        (date.getDay() === 0 || date.getDay() === 6) &&
        faker.datatype.boolean()
      ) {
        continue;
      }

      // Random start time between 7:00 and 10:00
      const startHour = faker.number.int({ min: 7, max: 10 });
      const startMinute = faker.number.int({ min: 0, max: 59 });
      const startTime = new Date(date);
      startTime.setHours(startHour, startMinute, 0, 0);

      // Random duration between 7 and 9 hours
      const durationHours = faker.number.int({ min: 7, max: 9 });
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + durationHours);

      // IN & OUT
      checkinsData.push(
        {
          userId: user.id,
          companyId: user.companyId,
          type: "NFC" as CheckinType,
          direction: "IN" as CheckinDirection,
          timestamp: startTime,
          tagId: companyTag.id,
          counter: faker.number.int({ min: 1, max: 1000 }),
          signature: faker.string.alphanumeric(16),
        },
        {
          userId: user.id,
          companyId: user.companyId,
          type: "NFC" as CheckinType,
          direction: "OUT" as CheckinDirection,
          timestamp: endTime,
          tagId: companyTag.id,
          counter: faker.number.int({ min: 1001, max: 2000 }),
          signature: faker.string.alphanumeric(16),
        },
      );
    }
  }

  await prisma.checkin.createMany({
    data: checkinsData,
  });

  console.warn("Seeding presence database finished.");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
