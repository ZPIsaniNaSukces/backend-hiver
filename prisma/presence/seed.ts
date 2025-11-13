import { PrismaClient } from "../../generated/prisma/presence-client";
import type {
  CheckinDirection,
  CheckinType,
} from "../../generated/prisma/presence-client";

const prisma = new PrismaClient();

async function main() {
  console.warn("Start seeding presence database ...");

  // Clear existing data and restart auto-incrementing identifiers
  await prisma.$executeRaw`TRUNCATE TABLE "Checkin", "CheckinUserInfo", "NfcTag" RESTART IDENTITY CASCADE`;

  // Seed NFC Tags for companies
  // Acme Corp (companyId: 1)
  const acmeTag = await prisma.nfcTag.create({
    data: {
      uid: "04:A1:B2:C3:D4:E5:F6",
      name: "Acme Main Entrance",
      companyId: 1,
      aesKey: "acme-secret-key-12345678901234567890",
    },
  });

  // Globex (companyId: 2)
  const globexTag = await prisma.nfcTag.create({
    data: {
      uid: "04:F6:E5:D4:C3:B2:A1",
      name: "Globex Office Gate",
      companyId: 2,
      aesKey: "globex-secret-key-1234567890123456789",
    },
  });

  // Seed CheckinUserInfo for users
  // Based on users seed: Alice (id: 1, companyId: 1), Martin (id: 2, companyId: 1, boss: Alice), Eve (id: 3, companyId: 2)
  await prisma.checkinUserInfo.create({
    data: {
      userId: 1, // Alice Admin
      bossId: null,
      companyId: 1, // Acme Corp
    },
  });

  await prisma.checkinUserInfo.create({
    data: {
      userId: 2, // Martin Manager
      bossId: 1, // Reports to Alice
      companyId: 1, // Acme Corp
    },
  });

  await prisma.checkinUserInfo.create({
    data: {
      userId: 3, // Eve Employee
      bossId: null,
      companyId: 2, // Globex
    },
  });

  // Seed some sample checkins
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(now);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  // Alice's checkins (Acme Corp)
  await prisma.checkin.create({
    data: {
      userId: 1,
      companyId: 1,
      type: "NFC" as CheckinType,
      direction: "IN" as CheckinDirection,
      timestamp: new Date(yesterday.setHours(8, 0, 0, 0)),
      tagId: acmeTag.id,
      counter: 1,
      signature: "alice-sig-1",
    },
  });

  await prisma.checkin.create({
    data: {
      userId: 1,
      companyId: 1,
      type: "NFC" as CheckinType,
      direction: "OUT" as CheckinDirection,
      timestamp: new Date(yesterday.setHours(17, 30, 0, 0)),
      tagId: acmeTag.id,
      counter: 2,
      signature: "alice-sig-2",
    },
  });

  // Martin's checkins (Acme Corp)
  await prisma.checkin.create({
    data: {
      userId: 2,
      companyId: 1,
      type: "ONLINE" as CheckinType,
      direction: "IN" as CheckinDirection,
      timestamp: new Date(yesterday.setHours(9, 15, 0, 0)),
      counter: 1,
    },
  });

  await prisma.checkin.create({
    data: {
      userId: 2,
      companyId: 1,
      type: "ONLINE" as CheckinType,
      direction: "OUT" as CheckinDirection,
      timestamp: new Date(yesterday.setHours(18, 0, 0, 0)),
      counter: 2,
    },
  });

  // Eve's checkins (Globex)
  await prisma.checkin.create({
    data: {
      userId: 3,
      companyId: 2,
      type: "NFC" as CheckinType,
      direction: "IN" as CheckinDirection,
      timestamp: new Date(yesterday.setHours(8, 30, 0, 0)),
      tagId: globexTag.id,
      counter: 1,
      signature: "eve-sig-1",
    },
  });

  await prisma.checkin.create({
    data: {
      userId: 3,
      companyId: 2,
      type: "NFC" as CheckinType,
      direction: "OUT" as CheckinDirection,
      timestamp: new Date(yesterday.setHours(16, 45, 0, 0)),
      tagId: globexTag.id,
      counter: 2,
      signature: "eve-sig-2",
    },
  });

  // Today's checkins
  await prisma.checkin.create({
    data: {
      userId: 1,
      companyId: 1,
      type: "NFC" as CheckinType,
      direction: "IN" as CheckinDirection,
      timestamp: new Date(now.setHours(8, 5, 0, 0)),
      tagId: acmeTag.id,
      counter: 3,
      signature: "alice-sig-3",
    },
  });

  await prisma.checkin.create({
    data: {
      userId: 2,
      companyId: 1,
      type: "ONLINE" as CheckinType,
      direction: "IN" as CheckinDirection,
      timestamp: new Date(now.setHours(9, 0, 0, 0)),
      counter: 3,
    },
  });

  console.warn("Seeding presence database finished.");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
