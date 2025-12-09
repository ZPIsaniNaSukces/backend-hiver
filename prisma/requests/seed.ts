import { PrismaClient } from "../../generated/prisma/requests-client";

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

async function main() {
  console.warn("Start seeding requests database ...");

  // Clear existing data and restart auto-incrementing identifiers
  await prisma.$executeRaw`TRUNCATE TABLE "AvailabilityRequest", "GeneralRequest", "RequestUserInfo" RESTART IDENTITY CASCADE`;

  // Create RequestUserInfo for all users
  for (const user of SEED_USERS) {
    await prisma.requestUserInfo.create({
      data: {
        id: user.id,
        bossId: user.bossId,
        companyId: COMPANY_ID,
        availableLeaveHours: 160, // 20 days * 8 hours
        name: user.name,
        lastName: user.surname,
        title: user.title,
      },
    });
  }

  console.warn(`Created RequestUserInfo for ${SEED_USERS.length} users`);

  // ==================== AVAILABILITY REQUESTS ====================
  // Past approved vacation requests
  const availabilityRequests = [
    // Approved past vacations (November)
    {
      userId: 5, // Tomasz
      date: new Date("2025-11-18"),
      hours: 8,
      type: "VACATION" as const,
      status: "APPROVED" as const,
      approvedById: 2, // Anna (his manager)
      acceptedRejectedAt: new Date("2025-11-10"),
    },
    {
      userId: 5,
      date: new Date("2025-11-19"),
      hours: 8,
      type: "VACATION" as const,
      status: "APPROVED" as const,
      approvedById: 2,
      acceptedRejectedAt: new Date("2025-11-10"),
    },
    {
      userId: 5,
      date: new Date("2025-11-20"),
      hours: 8,
      type: "VACATION" as const,
      status: "APPROVED" as const,
      approvedById: 2,
      acceptedRejectedAt: new Date("2025-11-10"),
    },
    {
      userId: 9, // Robert
      date: new Date("2025-11-25"),
      hours: 8,
      type: "VACATION" as const,
      status: "APPROVED" as const,
      approvedById: 3, // Piotr (his manager)
      acceptedRejectedAt: new Date("2025-11-18"),
    },
    {
      userId: 9,
      date: new Date("2025-11-26"),
      hours: 8,
      type: "VACATION" as const,
      status: "APPROVED" as const,
      approvedById: 3,
      acceptedRejectedAt: new Date("2025-11-18"),
    },
    {
      userId: 13, // Paweł
      date: new Date("2025-11-27"),
      hours: 8,
      type: "VACATION" as const,
      status: "APPROVED" as const,
      approvedById: 4, // Magdalena (his manager)
      acceptedRejectedAt: new Date("2025-11-20"),
    },
    {
      userId: 13,
      date: new Date("2025-11-28"),
      hours: 8,
      type: "VACATION" as const,
      status: "APPROVED" as const,
      approvedById: 4,
      acceptedRejectedAt: new Date("2025-11-20"),
    },

    // Past remote work requests (approved)
    {
      userId: 6, // Katarzyna
      date: new Date("2025-12-02"),
      hours: 8,
      type: "ONLINE_WORK" as const,
      status: "APPROVED" as const,
      approvedById: 2,
      acceptedRejectedAt: new Date("2025-11-28"),
    },
    {
      userId: 6,
      date: new Date("2025-12-03"),
      hours: 8,
      type: "ONLINE_WORK" as const,
      status: "APPROVED" as const,
      approvedById: 2,
      acceptedRejectedAt: new Date("2025-11-28"),
    },
    {
      userId: 10, // Joanna
      date: new Date("2025-12-04"),
      hours: 8,
      type: "ONLINE_WORK" as const,
      status: "APPROVED" as const,
      approvedById: 3,
      acceptedRejectedAt: new Date("2025-12-01"),
    },
    {
      userId: 10,
      date: new Date("2025-12-05"),
      hours: 8,
      type: "ONLINE_WORK" as const,
      status: "APPROVED" as const,
      approvedById: 3,
      acceptedRejectedAt: new Date("2025-12-01"),
    },

    // Pending vacation requests (Christmas period)
    {
      userId: 6, // Katarzyna
      date: new Date("2025-12-23"),
      hours: 8,
      type: "VACATION" as const,
      status: "PENDING" as const,
      approvedById: null,
      acceptedRejectedAt: null,
    },
    {
      userId: 6,
      date: new Date("2025-12-24"),
      hours: 8,
      type: "VACATION" as const,
      status: "PENDING" as const,
      approvedById: null,
      acceptedRejectedAt: null,
    },
    {
      userId: 6,
      date: new Date("2025-12-27"),
      hours: 8,
      type: "VACATION" as const,
      status: "PENDING" as const,
      approvedById: null,
      acceptedRejectedAt: null,
    },
    {
      userId: 10, // Joanna
      date: new Date("2025-12-30"),
      hours: 8,
      type: "VACATION" as const,
      status: "PENDING" as const,
      approvedById: null,
      acceptedRejectedAt: null,
    },
    {
      userId: 10,
      date: new Date("2025-12-31"),
      hours: 8,
      type: "VACATION" as const,
      status: "PENDING" as const,
      approvedById: null,
      acceptedRejectedAt: null,
    },
    {
      userId: 10,
      date: new Date("2026-01-02"),
      hours: 8,
      type: "VACATION" as const,
      status: "PENDING" as const,
      approvedById: null,
      acceptedRejectedAt: null,
    },
    {
      userId: 11, // Krzysztof
      date: new Date("2025-12-23"),
      hours: 8,
      type: "VACATION" as const,
      status: "PENDING" as const,
      approvedById: null,
      acceptedRejectedAt: null,
    },
    {
      userId: 11,
      date: new Date("2025-12-24"),
      hours: 8,
      type: "VACATION" as const,
      status: "PENDING" as const,
      approvedById: null,
      acceptedRejectedAt: null,
    },
    {
      userId: 15, // Łukasz
      date: new Date("2025-12-27"),
      hours: 8,
      type: "VACATION" as const,
      status: "PENDING" as const,
      approvedById: null,
      acceptedRejectedAt: null,
    },
    {
      userId: 15,
      date: new Date("2025-12-30"),
      hours: 8,
      type: "VACATION" as const,
      status: "PENDING" as const,
      approvedById: null,
      acceptedRejectedAt: null,
    },
    {
      userId: 15,
      date: new Date("2025-12-31"),
      hours: 8,
      type: "VACATION" as const,
      status: "PENDING" as const,
      approvedById: null,
      acceptedRejectedAt: null,
    },

    // Pending remote work requests
    {
      userId: 7, // Michał
      date: new Date("2025-12-11"),
      hours: 8,
      type: "ONLINE_WORK" as const,
      status: "PENDING" as const,
      approvedById: null,
      acceptedRejectedAt: null,
    },
    {
      userId: 7,
      date: new Date("2025-12-12"),
      hours: 8,
      type: "ONLINE_WORK" as const,
      status: "PENDING" as const,
      approvedById: null,
      acceptedRejectedAt: null,
    },
    {
      userId: 16, // Natalia
      date: new Date("2025-12-16"),
      hours: 8,
      type: "ONLINE_WORK" as const,
      status: "PENDING" as const,
      approvedById: null,
      acceptedRejectedAt: null,
    },
    {
      userId: 16,
      date: new Date("2025-12-17"),
      hours: 8,
      type: "ONLINE_WORK" as const,
      status: "PENDING" as const,
      approvedById: null,
      acceptedRejectedAt: null,
    },

    // Rejected vacation request
    {
      userId: 7, // Michał
      date: new Date("2025-12-15"),
      hours: 8,
      type: "VACATION" as const,
      status: "REJECTED" as const,
      approvedById: 2, // Anna rejected
      acceptedRejectedAt: new Date("2025-12-05"),
    },
    {
      userId: 7,
      date: new Date("2025-12-16"),
      hours: 8,
      type: "VACATION" as const,
      status: "REJECTED" as const,
      approvedById: 2,
      acceptedRejectedAt: new Date("2025-12-05"),
    },
    {
      userId: 7,
      date: new Date("2025-12-17"),
      hours: 8,
      type: "VACATION" as const,
      status: "REJECTED" as const,
      approvedById: 2,
      acceptedRejectedAt: new Date("2025-12-05"),
    },

    // Some offline work (field work)
    {
      userId: 9, // Robert - marketing events
      date: new Date("2025-12-10"),
      hours: 8,
      type: "OFFLINE_WORK" as const,
      status: "APPROVED" as const,
      approvedById: 3,
      acceptedRejectedAt: new Date("2025-12-03"),
    },
    {
      userId: 20, // Karolina - PR event
      date: new Date("2025-12-12"),
      hours: 8,
      type: "OFFLINE_WORK" as const,
      status: "PENDING" as const,
      approvedById: null,
      acceptedRejectedAt: null,
    },
  ];

  for (const request of availabilityRequests) {
    await prisma.availabilityRequest.create({ data: request });
  }

  console.warn(`Created ${availabilityRequests.length} availability requests`);

  // ==================== GENERAL REQUESTS ====================
  const generalRequests = [
    // Equipment requests
    {
      userId: 7, // Michał
      description:
        "Prośba o nową klawiaturę mechaniczną - obecna ma uszkodzony klawisz Enter.",
      status: "PENDING" as const,
      approvedById: null,
      acceptedRejectedAt: null,
    },
    {
      userId: 6, // Katarzyna
      description:
        "Wniosek o drugi monitor do pracy - 27 cali do projektowania UI.",
      status: "APPROVED" as const,
      approvedById: 2,
      acceptedRejectedAt: new Date("2025-11-28"),
    },
    {
      userId: 8, // Agnieszka
      description:
        "Prośba o upgrade laptopa - więcej RAM (32GB) do konteneryzacji i Kubernetes.",
      status: "PENDING" as const,
      approvedById: null,
      acceptedRejectedAt: null,
    },
    {
      userId: 17, // Marcin
      description: "Wniosek o tablet graficzny Wacom do projektowania.",
      status: "APPROVED" as const,
      approvedById: 3,
      acceptedRejectedAt: new Date("2025-11-20"),
    },
    {
      userId: 19, // Grzegorz
      description: "Prośba o słuchawki z ANC do pracy w open space.",
      status: "PENDING" as const,
      approvedById: null,
      acceptedRejectedAt: null,
    },

    // Training/Conference requests
    {
      userId: 5, // Tomasz
      description:
        "Wniosek o udział w konferencji AWS re:Invent 2026 - Las Vegas.",
      status: "PENDING" as const,
      approvedById: null,
      acceptedRejectedAt: null,
    },
    {
      userId: 16, // Natalia
      description: "Prośba o szkolenie ISTQB Advanced Level - Test Analyst.",
      status: "APPROVED" as const,
      approvedById: 2,
      acceptedRejectedAt: new Date("2025-12-01"),
    },
    {
      userId: 11, // Krzysztof
      description: "Wniosek o kurs Google Analytics 4 Certification.",
      status: "APPROVED" as const,
      approvedById: 3,
      acceptedRejectedAt: new Date("2025-11-25"),
    },
    {
      userId: 14, // Ewa
      description:
        "Prośba o szkolenie z rekrutacji IT - Sourcing Ninja Masterclass.",
      status: "PENDING" as const,
      approvedById: null,
      acceptedRejectedAt: null,
    },

    // Other requests
    {
      userId: 12, // Monika
      description:
        "Wniosek o zmianę godzin pracy na 7:00-15:00 (opieka nad dzieckiem).",
      status: "APPROVED" as const,
      approvedById: 3,
      acceptedRejectedAt: new Date("2025-11-15"),
    },
    {
      userId: 18, // Aleksandra
      description:
        "Prośba o budżet na kawę i przekąski do kuchni biurowej - 500 PLN/miesiąc.",
      status: "APPROVED" as const,
      approvedById: 4,
      acceptedRejectedAt: new Date("2025-11-20"),
    },
    {
      userId: 13, // Paweł
      description:
        "Wniosek o dostęp do systemu ATS (Applicant Tracking System) - wsparcie rekrutacji.",
      status: "APPROVED" as const,
      approvedById: 4,
      acceptedRejectedAt: new Date("2025-11-18"),
    },
    {
      userId: 20, // Karolina
      description: "Prośba o wizytówki firmowe - 200 sztuk.",
      status: "PENDING" as const,
      approvedById: null,
      acceptedRejectedAt: null,
    },
    {
      userId: 10, // Joanna
      description:
        "Wniosek o licencję Adobe Creative Cloud do edycji materiałów marketingowych.",
      status: "REJECTED" as const,
      approvedById: 3,
      acceptedRejectedAt: new Date("2025-12-02"),
    },
  ];

  for (const request of generalRequests) {
    await prisma.generalRequest.create({ data: request });
  }

  console.warn(`Created ${generalRequests.length} general requests`);
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
