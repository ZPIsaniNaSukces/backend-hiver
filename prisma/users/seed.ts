import { ACCOUNT_STATUS, PrismaClient, USER_ROLE } from "@prisma/client";
import type { Company, Team, User } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const hashPassword = async (raw: string) => {
  const saltRounds = 12;
  return bcrypt.hash(raw, saltRounds);
};

// ============================================================================
// SHARED USER DATA - This is the source of truth for all microservices
// ============================================================================
export interface UserSeedData {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  title: string;
  role: USER_ROLE;
  teamName: string;
  bossId: number | null;
}

// Company: Hiver Technologies (id: 1)
// Teams: Development (id: 1), Marketing (id: 2), HR (id: 3)

export const SEED_USERS: UserSeedData[] = [
  // ==================== ADMIN (CEO) ====================
  {
    id: 1,
    name: "Jan",
    surname: "Kowalski",
    email: "jan.kowalski@hiver.tech",
    phone: "+48 500 100 001",
    dateOfBirth: new Date("1975-03-15"),
    title: "CEO",
    role: USER_ROLE.ADMIN,
    teamName: "Development", // Admin oversees all, but assigned to Development
    bossId: null,
  },

  // ==================== MANAGERS (3) ====================
  // Manager 1: Development Team Leader
  {
    id: 2,
    name: "Anna",
    surname: "Nowak",
    email: "anna.nowak@hiver.tech",
    phone: "+48 500 100 002",
    dateOfBirth: new Date("1985-07-22"),
    title: "Development Team Lead",
    role: USER_ROLE.MANAGER,
    teamName: "Development",
    bossId: 1,
  },
  // Manager 2: Marketing Team Leader
  {
    id: 3,
    name: "Piotr",
    surname: "Wiśniewski",
    email: "piotr.wisniewski@hiver.tech",
    phone: "+48 500 100 003",
    dateOfBirth: new Date("1982-11-08"),
    title: "Marketing Team Lead",
    role: USER_ROLE.MANAGER,
    teamName: "Marketing",
    bossId: 1,
  },
  // Manager 3: HR Team Leader
  {
    id: 4,
    name: "Magdalena",
    surname: "Kamińska",
    email: "magdalena.kaminska@hiver.tech",
    phone: "+48 500 100 004",
    dateOfBirth: new Date("1988-04-30"),
    title: "HR Team Lead",
    role: USER_ROLE.MANAGER,
    teamName: "HR",
    bossId: 1,
  },

  // ==================== DEVELOPMENT TEAM EMPLOYEES (4) ====================
  {
    id: 5,
    name: "Tomasz",
    surname: "Lewandowski",
    email: "tomasz.lewandowski@hiver.tech",
    phone: "+48 500 100 005",
    dateOfBirth: new Date("1990-01-12"),
    title: "Senior Backend Developer",
    role: USER_ROLE.EMPLOYEE,
    teamName: "Development",
    bossId: 2,
  },
  {
    id: 6,
    name: "Katarzyna",
    surname: "Zielińska",
    email: "katarzyna.zielinska@hiver.tech",
    phone: "+48 500 100 006",
    dateOfBirth: new Date("1993-06-25"),
    title: "Frontend Developer",
    role: USER_ROLE.EMPLOYEE,
    teamName: "Development",
    bossId: 2,
  },
  {
    id: 7,
    name: "Michał",
    surname: "Szymański",
    email: "michal.szymanski@hiver.tech",
    phone: "+48 500 100 007",
    dateOfBirth: new Date("1995-09-18"),
    title: "Junior Developer",
    role: USER_ROLE.EMPLOYEE,
    teamName: "Development",
    bossId: 2,
  },
  {
    id: 8,
    name: "Agnieszka",
    surname: "Woźniak",
    email: "agnieszka.wozniak@hiver.tech",
    phone: "+48 500 100 008",
    dateOfBirth: new Date("1991-12-03"),
    title: "DevOps Engineer",
    role: USER_ROLE.EMPLOYEE,
    teamName: "Development",
    bossId: 2,
  },

  // ==================== MARKETING TEAM EMPLOYEES (4) ====================
  {
    id: 9,
    name: "Robert",
    surname: "Dąbrowski",
    email: "robert.dabrowski@hiver.tech",
    phone: "+48 500 100 009",
    dateOfBirth: new Date("1989-02-14"),
    title: "Senior Marketing Specialist",
    role: USER_ROLE.EMPLOYEE,
    teamName: "Marketing",
    bossId: 3,
  },
  {
    id: 10,
    name: "Joanna",
    surname: "Kozłowska",
    email: "joanna.kozlowska@hiver.tech",
    phone: "+48 500 100 010",
    dateOfBirth: new Date("1994-08-07"),
    title: "Content Manager",
    role: USER_ROLE.EMPLOYEE,
    teamName: "Marketing",
    bossId: 3,
  },
  {
    id: 11,
    name: "Krzysztof",
    surname: "Jankowski",
    email: "krzysztof.jankowski@hiver.tech",
    phone: "+48 500 100 011",
    dateOfBirth: new Date("1992-05-21"),
    title: "SEO Specialist",
    role: USER_ROLE.EMPLOYEE,
    teamName: "Marketing",
    bossId: 3,
  },
  {
    id: 12,
    name: "Monika",
    surname: "Mazur",
    email: "monika.mazur@hiver.tech",
    phone: "+48 500 100 012",
    dateOfBirth: new Date("1996-10-16"),
    title: "Social Media Manager",
    role: USER_ROLE.EMPLOYEE,
    teamName: "Marketing",
    bossId: 3,
  },

  // ==================== HR TEAM EMPLOYEES (3) ====================
  {
    id: 13,
    name: "Paweł",
    surname: "Krawczyk",
    email: "pawel.krawczyk@hiver.tech",
    phone: "+48 500 100 013",
    dateOfBirth: new Date("1987-03-28"),
    title: "HR Specialist",
    role: USER_ROLE.EMPLOYEE,
    teamName: "HR",
    bossId: 4,
  },
  {
    id: 14,
    name: "Ewa",
    surname: "Piotrowska",
    email: "ewa.piotrowska@hiver.tech",
    phone: "+48 500 100 014",
    dateOfBirth: new Date("1991-07-09"),
    title: "Recruitment Specialist",
    role: USER_ROLE.EMPLOYEE,
    teamName: "HR",
    bossId: 4,
  },
  {
    id: 15,
    name: "Łukasz",
    surname: "Grabowski",
    email: "lukasz.grabowski@hiver.tech",
    phone: "+48 500 100 015",
    dateOfBirth: new Date("1993-11-02"),
    title: "Payroll Specialist",
    role: USER_ROLE.EMPLOYEE,
    teamName: "HR",
    bossId: 4,
  },

  // ==================== ADDITIONAL EMPLOYEES (5) ====================
  {
    id: 16,
    name: "Natalia",
    surname: "Pawlak",
    email: "natalia.pawlak@hiver.tech",
    phone: "+48 500 100 016",
    dateOfBirth: new Date("1994-04-19"),
    title: "QA Engineer",
    role: USER_ROLE.EMPLOYEE,
    teamName: "Development",
    bossId: 2,
  },
  {
    id: 17,
    name: "Marcin",
    surname: "Michalski",
    email: "marcin.michalski@hiver.tech",
    phone: "+48 500 100 017",
    dateOfBirth: new Date("1990-08-11"),
    title: "UI/UX Designer",
    role: USER_ROLE.EMPLOYEE,
    teamName: "Marketing",
    bossId: 3,
  },
  {
    id: 18,
    name: "Aleksandra",
    surname: "Adamczyk",
    email: "aleksandra.adamczyk@hiver.tech",
    phone: "+48 500 100 018",
    dateOfBirth: new Date("1992-12-24"),
    title: "Office Manager",
    role: USER_ROLE.EMPLOYEE,
    teamName: "HR",
    bossId: 4,
  },
  {
    id: 19,
    name: "Grzegorz",
    surname: "Sikora",
    email: "grzegorz.sikora@hiver.tech",
    phone: "+48 500 100 019",
    dateOfBirth: new Date("1988-06-05"),
    title: "System Administrator",
    role: USER_ROLE.EMPLOYEE,
    teamName: "Development",
    bossId: 2,
  },
  {
    id: 20,
    name: "Karolina",
    surname: "Baran",
    email: "karolina.baran@hiver.tech",
    phone: "+48 500 100 020",
    dateOfBirth: new Date("1995-02-28"),
    title: "PR Specialist",
    role: USER_ROLE.EMPLOYEE,
    teamName: "Marketing",
    bossId: 3,
  },
];

// Common password for all users
export const SEED_PASSWORD = "ChangeMe123!";

// Company info
export const SEED_COMPANY = {
  id: 1,
  name: "Hiver Technologies",
  domain: "hiver.tech",
};

// Teams info
export const SEED_TEAMS = [
  { id: 1, name: "Development", leaderId: 2 },
  { id: 2, name: "Marketing", leaderId: 3 },
  { id: 3, name: "HR", leaderId: 4 },
];

async function main() {
  console.warn("Start seeding users database...");

  // Clear existing data and restart auto-incrementing identifiers for deterministic seeding
  await prisma.$executeRaw`TRUNCATE TABLE "User", "Team", "Company", "LeaveRequest", "LeaveRequestUserInfo" RESTART IDENTITY CASCADE`;

  // Create the company
  const company: Company = await prisma.company.create({
    data: {
      name: SEED_COMPANY.name,
      domain: SEED_COMPANY.domain,
    },
  });

  console.warn(`Created company: ${company.name}`);

  // Create teams (without leaders first)
  const teams: Team[] = [];
  for (const teamData of SEED_TEAMS) {
    const team = await prisma.team.create({
      data: {
        name: teamData.name,
        companyId: company.id,
      },
    });
    teams.push(team);
  }

  console.warn(`Created ${teams.length} teams`);

  // Hash password once (all users have the same password)
  const hashedPassword = await hashPassword(SEED_PASSWORD);

  // Create users in order (to handle boss relationships)
  const createdUsers: User[] = [];
  for (const userData of SEED_USERS) {
    const team = teams.find((t) => t.name === userData.teamName);
    if (!team) {
      throw new Error(`Team not found: ${userData.teamName}`);
    }

    const user = await prisma.user.create({
      data: {
        name: userData.name,
        surname: userData.surname,
        email: userData.email,
        password: hashedPassword,
        phone: userData.phone,
        dateOfBirth: userData.dateOfBirth,
        title: userData.title,
        role: userData.role,
        companyId: company.id,
        accountStatus: ACCOUNT_STATUS.VERIFIED,
        bossId: userData.bossId,
        teams: {
          connect: [{ id: team.id }],
        },
      },
    });
    createdUsers.push(user);
  }

  console.warn(`Created ${createdUsers.length} users`);

  // Assign team leaders
  for (const teamData of SEED_TEAMS) {
    const team = teams.find((t) => t.name === teamData.name);
    if (team) {
      await prisma.team.update({
        where: { id: team.id },
        data: { leaderId: teamData.leaderId },
      });
    }
  }

  console.warn("Assigned team leaders");

  // Create LeaveRequestUserInfo for all users
  for (const userData of SEED_USERS) {
    await prisma.leaveRequestUserInfo.create({
      data: {
        id: userData.id,
        bossId: userData.bossId,
        companyId: company.id,
        availableLeaveDays: 20,
      },
    });
  }

  console.warn("Created LeaveRequestUserInfo entries");

  // Create some sample leave requests
  const now = new Date();
  const leaveRequests = [
    // ==================== APPROVED PAST VACATIONS ====================
    {
      userId: 5, // Tomasz
      startsAt: new Date("2025-11-18"),
      endsAt: new Date("2025-11-22"),
      reason: "Urlop wypoczynkowy - wyjazd rodzinny",
      status: "APPROVED" as const,
      approvedById: 2, // Anna (manager)
    },
    {
      userId: 9, // Robert
      startsAt: new Date("2025-11-25"),
      endsAt: new Date("2025-11-28"),
      reason: "Sprawy rodzinne",
      status: "APPROVED" as const,
      approvedById: 3, // Piotr (manager)
    },
    {
      userId: 13, // Paweł
      startsAt: new Date("2025-11-27"),
      endsAt: new Date("2025-11-29"),
      reason: "Długi weekend - urlop okolicznościowy",
      status: "APPROVED" as const,
      approvedById: 4, // Magdalena (manager)
    },
    {
      userId: 8, // Agnieszka
      startsAt: new Date("2025-11-04"),
      endsAt: new Date("2025-11-08"),
      reason: "Urlop wypoczynkowy - wyjazd zagraniczny",
      status: "APPROVED" as const,
      approvedById: 2,
    },
    {
      userId: 11, // Krzysztof
      startsAt: new Date("2025-10-21"),
      endsAt: new Date("2025-10-25"),
      reason: "Urlop wypoczynkowy",
      status: "APPROVED" as const,
      approvedById: 3,
    },
    {
      userId: 16, // Natalia
      startsAt: new Date("2025-10-14"),
      endsAt: new Date("2025-10-18"),
      reason: "Wyjazd na konferencję + dodatkowe dni urlopu",
      status: "APPROVED" as const,
      approvedById: 2,
    },
    {
      userId: 14, // Ewa
      startsAt: new Date("2025-09-02"),
      endsAt: new Date("2025-09-06"),
      reason: "Urlop po sezonie urlopowym",
      status: "APPROVED" as const,
      approvedById: 4,
    },
    {
      userId: 17, // Marcin
      startsAt: new Date("2025-08-12"),
      endsAt: new Date("2025-08-23"),
      reason: "Urlop wypoczynkowy - wakacje letnie",
      status: "APPROVED" as const,
      approvedById: 3,
    },

    // ==================== PENDING VACATION REQUESTS (CHRISTMAS) ====================
    {
      userId: 6, // Katarzyna
      startsAt: new Date("2025-12-23"),
      endsAt: new Date("2025-12-27"),
      reason: "Urlop świąteczny - wyjazd do rodziny",
      status: "PENDING" as const,
      approvedById: null,
    },
    {
      userId: 10, // Joanna
      startsAt: new Date("2025-12-30"),
      endsAt: new Date("2026-01-03"),
      reason: "Urlop noworoczny",
      status: "PENDING" as const,
      approvedById: null,
    },
    {
      userId: 11, // Krzysztof
      startsAt: new Date("2025-12-23"),
      endsAt: new Date("2025-12-24"),
      reason: "Wigilia - czas z rodziną",
      status: "PENDING" as const,
      approvedById: null,
    },
    {
      userId: 15, // Łukasz
      startsAt: new Date("2025-12-27"),
      endsAt: new Date("2025-12-31"),
      reason: "Urlop między świętami",
      status: "PENDING" as const,
      approvedById: null,
    },
    {
      userId: 18, // Aleksandra
      startsAt: new Date("2025-12-23"),
      endsAt: new Date("2026-01-02"),
      reason: "Urlop świąteczno-noworoczny",
      status: "PENDING" as const,
      approvedById: null,
    },
    {
      userId: 12, // Monika
      startsAt: new Date("2025-12-30"),
      endsAt: new Date("2025-12-31"),
      reason: "Sylwester z rodziną",
      status: "PENDING" as const,
      approvedById: null,
    },

    // ==================== PENDING JANUARY REQUESTS ====================
    {
      userId: 19, // Grzegorz
      startsAt: new Date("2026-01-20"),
      endsAt: new Date("2026-01-24"),
      reason: "Urlop zimowy - wyjazd w góry",
      status: "PENDING" as const,
      approvedById: null,
    },
    {
      userId: 20, // Karolina
      startsAt: new Date("2026-01-27"),
      endsAt: new Date("2026-01-31"),
      reason: "Urlop wypoczynkowy - regeneracja po sezonie",
      status: "PENDING" as const,
      approvedById: null,
    },

    // ==================== REJECTED REQUESTS ====================
    {
      userId: 7, // Michał
      startsAt: new Date("2025-12-15"),
      endsAt: new Date("2025-12-20"),
      reason: "Wyjazd prywatny - sprint deployment week",
      status: "REJECTED" as const,
      approvedById: 2,
    },
    {
      userId: 12, // Monika
      startsAt: new Date("2025-12-09"),
      endsAt: new Date("2025-12-13"),
      reason: "Dodatkowy urlop - kampania świąteczna w toku",
      status: "REJECTED" as const,
      approvedById: 3,
    },

    // ==================== SINGLE DAY LEAVES ====================
    {
      userId: 2, // Anna (manager też ma urlopy!)
      startsAt: new Date("2025-12-16"),
      endsAt: new Date("2025-12-16"),
      reason: "Dzień wolny - sprawy urzędowe",
      status: "APPROVED" as const,
      approvedById: 1, // Jan (CEO)
    },
    {
      userId: 3, // Piotr (manager)
      startsAt: new Date("2025-12-11"),
      endsAt: new Date("2025-12-12"),
      reason: "Urlop zdrowotny",
      status: "APPROVED" as const,
      approvedById: 1,
    },
    {
      userId: 4, // Magdalena (manager)
      startsAt: new Date("2025-12-19"),
      endsAt: new Date("2025-12-19"),
      reason: "Sprawy osobiste",
      status: "PENDING" as const,
      approvedById: null,
    },
  ];

  for (const request of leaveRequests) {
    await prisma.leaveRequest.create({
      data: request,
    });
  }

  console.warn(`Created ${leaveRequests.length} leave requests`);
  console.warn("Seeding users database finished.");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
