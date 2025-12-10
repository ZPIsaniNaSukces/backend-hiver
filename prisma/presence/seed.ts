import { PrismaClient } from "../../generated/prisma/presence-client";
import type {
  CheckinDirection,
  CheckinType,
} from "../../generated/prisma/presence-client";

const prisma = new PrismaClient();

// ============================================================================
// SHARED USER DATA - Must match users/seed.ts exactly
// ============================================================================
interface UserSeedData {
  id: number;
  name: string;
  surname: string;
  title: string;
  teamName: string;
  bossId: number | null;
}

const SEED_USERS: UserSeedData[] = [
  {
    id: 1,
    name: "Jan",
    surname: "Kowalski",
    title: "CEO",
    teamName: "Development",
    bossId: null,
  },
  {
    id: 2,
    name: "Anna",
    surname: "Nowak",
    title: "Development Team Lead",
    teamName: "Development",
    bossId: 1,
  },
  {
    id: 3,
    name: "Piotr",
    surname: "Wiśniewski",
    title: "Marketing Team Lead",
    teamName: "Marketing",
    bossId: 1,
  },
  {
    id: 4,
    name: "Magdalena",
    surname: "Kamińska",
    title: "HR Team Lead",
    teamName: "HR",
    bossId: 1,
  },
  {
    id: 5,
    name: "Tomasz",
    surname: "Lewandowski",
    title: "Senior Backend Developer",
    teamName: "Development",
    bossId: 2,
  },
  {
    id: 6,
    name: "Katarzyna",
    surname: "Zielińska",
    title: "Frontend Developer",
    teamName: "Development",
    bossId: 2,
  },
  {
    id: 7,
    name: "Michał",
    surname: "Szymański",
    title: "Junior Developer",
    teamName: "Development",
    bossId: 2,
  },
  {
    id: 8,
    name: "Agnieszka",
    surname: "Woźniak",
    title: "DevOps Engineer",
    teamName: "Development",
    bossId: 2,
  },
  {
    id: 9,
    name: "Robert",
    surname: "Dąbrowski",
    title: "Senior Marketing Specialist",
    teamName: "Marketing",
    bossId: 3,
  },
  {
    id: 10,
    name: "Joanna",
    surname: "Kozłowska",
    title: "Content Manager",
    teamName: "Marketing",
    bossId: 3,
  },
  {
    id: 11,
    name: "Krzysztof",
    surname: "Jankowski",
    title: "SEO Specialist",
    teamName: "Marketing",
    bossId: 3,
  },
  {
    id: 12,
    name: "Monika",
    surname: "Mazur",
    title: "Social Media Manager",
    teamName: "Marketing",
    bossId: 3,
  },
  {
    id: 13,
    name: "Paweł",
    surname: "Krawczyk",
    title: "HR Specialist",
    teamName: "HR",
    bossId: 4,
  },
  {
    id: 14,
    name: "Ewa",
    surname: "Piotrowska",
    title: "Recruitment Specialist",
    teamName: "HR",
    bossId: 4,
  },
  {
    id: 15,
    name: "Łukasz",
    surname: "Grabowski",
    title: "Payroll Specialist",
    teamName: "HR",
    bossId: 4,
  },
  {
    id: 16,
    name: "Natalia",
    surname: "Pawlak",
    title: "QA Engineer",
    teamName: "Development",
    bossId: 2,
  },
  {
    id: 17,
    name: "Marcin",
    surname: "Michalski",
    title: "UI/UX Designer",
    teamName: "Marketing",
    bossId: 3,
  },
  {
    id: 18,
    name: "Aleksandra",
    surname: "Adamczyk",
    title: "Office Manager",
    teamName: "HR",
    bossId: 4,
  },
  {
    id: 19,
    name: "Grzegorz",
    surname: "Sikora",
    title: "System Administrator",
    teamName: "Development",
    bossId: 2,
  },
  {
    id: 20,
    name: "Karolina",
    surname: "Baran",
    title: "PR Specialist",
    teamName: "Marketing",
    bossId: 3,
  },
];

const COMPANY_ID = 1;

// Helper to create a date with specific hour/minute
function createDateTime(daysAgo: number, hour: number, minute: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, minute, 0, 0);
  return date;
}

async function main() {
  console.warn("Start seeding presence database ...");

  // Clear existing data and restart auto-incrementing identifiers
  await prisma.$executeRaw`TRUNCATE TABLE "Checkin", "CheckinUserInfo", "NfcTag" RESTART IDENTITY CASCADE`;

  // Seed NFC Tags for Hiver Technologies
  const mainEntranceTag = await prisma.nfcTag.create({
    data: {
      uid: "042C6632A91190",
      name: "Hiver HQ - Wejście główne",
      companyId: COMPANY_ID,
      aesKey: "169b35e5fd663d4042224323bc8ebc71",
    },
  });

  const sideEntranceTag = await prisma.nfcTag.create({
    data: {
      uid: "04566732A91190",
      name: "Hiver HQ - Wejście boczne",
      companyId: COMPANY_ID,
      aesKey: "3b51218db435bc7e5a6bbb5258dd8d16",
    },
  });

  const garageTag = await prisma.nfcTag.create({
    data: {
      uid: "044D6732A91190",
      name: "Hiver HQ - Garaż",
      companyId: COMPANY_ID,
      aesKey: "73497a1db8fcb4aef99a38b1c9d7a139",
    },
  });

  const parkingTag = await prisma.nfcTag.create({
    data: {
      uid: "04456732A91190",
      name: "Hiver HQ - Parking",
      companyId: COMPANY_ID,
      aesKey: "5dd52c6788df78860320e6c1ce3d1db8",
    },
  });

  console.warn("Created NFC tags");

  // Create CheckinUserInfo for all users
  for (const user of SEED_USERS) {
    await prisma.checkinUserInfo.create({
      data: {
        userId: user.id,
        bossId: user.bossId,
        companyId: COMPANY_ID,
      },
    });
  }

  console.warn(`Created CheckinUserInfo for ${SEED_USERS.length} users`);

  // Generate realistic check-in/check-out data for the last 14 days
  // This creates history for dashboard widgets showing office presence
  const checkins: Array<{
    userId: number;
    companyId: number;
    type: CheckinType;
    direction: CheckinDirection;
    timestamp: Date;
    tagId: number | null;
    counter: number;
    signature: string | null;
  }> = [];

  let globalCounter = 1;

  // Generate check-ins for last 14 days (excluding weekends)
  for (let daysAgo = 13; daysAgo >= 0; daysAgo--) {
    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() - daysAgo);

    // Skip weekends
    const dayOfWeek = checkDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    // Determine how many people come to office (varies by day)
    // More people come Mon-Wed, fewer Thu-Fri
    const attendanceRate = dayOfWeek <= 3 ? 0.85 : 0.65;

    for (const user of SEED_USERS) {
      // Random chance of coming to office based on attendance rate
      if (Math.random() > attendanceRate) continue;

      // Vary check-in type: 70% NFC, 20% ONLINE, 10% OFFLINE
      const typeRoll = Math.random();
      let type: CheckinType;
      let tagId: number | null = null;
      let signature: string | null = null;

      if (typeRoll < 0.7) {
        type = "NFC" as CheckinType;
        // Randomly pick an entrance
        const tagRoll = Math.random();
        if (tagRoll < 0.6) {
          tagId = mainEntranceTag.id;
        } else if (tagRoll < 0.9) {
          tagId = sideEntranceTag.id;
        } else {
          tagId = garageTag.id;
        }
        signature = `sig-${user.id}-${daysAgo}-${globalCounter}`;
      } else if (typeRoll < 0.9) {
        type = "ONLINE" as CheckinType;
      } else {
        type = "OFFLINE" as CheckinType;
      }

      // Random check-in time between 7:30 and 9:30
      const inHour = 7 + Math.floor(Math.random() * 2);
      const inMinute = Math.floor(Math.random() * 60);

      // Random check-out time between 16:00 and 19:00
      const outHour = 16 + Math.floor(Math.random() * 3);
      const outMinute = Math.floor(Math.random() * 60);

      // Check-in
      checkins.push({
        userId: user.id,
        companyId: COMPANY_ID,
        type,
        direction: "IN" as CheckinDirection,
        timestamp: createDateTime(daysAgo, inHour, inMinute),
        tagId,
        counter: globalCounter++,
        signature,
      });

      // Check-out (same type as check-in usually)
      checkins.push({
        userId: user.id,
        companyId: COMPANY_ID,
        type,
        direction: "OUT" as CheckinDirection,
        timestamp: createDateTime(daysAgo, outHour, outMinute),
        tagId,
        counter: globalCounter++,
        signature: signature ? `${signature}-out` : null,
      });
    }
  }

  // Add today's check-ins (some people already in office)
  const todayAttendees = SEED_USERS.filter(() => Math.random() < 0.7);
  for (const user of todayAttendees) {
    const inHour = 7 + Math.floor(Math.random() * 2);
    const inMinute = Math.floor(Math.random() * 60);

    const typeRoll = Math.random();
    let type: CheckinType;
    let tagId: number | null = null;
    let signature: string | null = null;

    if (typeRoll < 0.7) {
      type = "NFC" as CheckinType;
      tagId = Math.random() < 0.7 ? mainEntranceTag.id : sideEntranceTag.id;
      signature = `sig-${user.id}-today-${globalCounter}`;
    } else {
      type = "ONLINE" as CheckinType;
    }

    checkins.push({
      userId: user.id,
      companyId: COMPANY_ID,
      type,
      direction: "IN" as CheckinDirection,
      timestamp: createDateTime(0, inHour, inMinute),
      tagId,
      counter: globalCounter++,
      signature,
    });

    // Some people have already left (random 30%)
    if (Math.random() < 0.3) {
      checkins.push({
        userId: user.id,
        companyId: COMPANY_ID,
        type,
        direction: "OUT" as CheckinDirection,
        timestamp: createDateTime(
          0,
          14 + Math.floor(Math.random() * 3),
          Math.floor(Math.random() * 60),
        ),
        tagId,
        counter: globalCounter++,
        signature: signature ? `${signature}-out` : null,
      });
    }
  }

  // Insert all checkins
  for (const checkin of checkins) {
    await prisma.checkin.create({ data: checkin });
  }

  console.warn(`Created ${checkins.length} check-in/check-out records`);
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
