import { fakerPL as faker } from "@faker-js/faker";
import { ACCOUNT_STATUS, USER_ROLE } from "@prisma/client";

export interface SeedCompany {
  id: number;
  name: string;
  domain: string;
}

export interface SeedPerson {
  id: number;
  name: string;
  surname: string;
  email: string;
  title: string;
  role: USER_ROLE;
  accountStatus: ACCOUNT_STATUS;
  companyId: number;
  companyName: string;
  teamName: string;
  bossId: number | null;
  availableLeaveHours: number;
}

/**
 * Named seed users - these are fixed users that will appear in all services
 * with consistent data. Use these for testing and development.
 *
 * Structure per company:
 * - 1 Admin (company admin)
 * - 1 Manager (reports to admin)
 * - Named employees (report to manager)
 * - Additional random employees
 */
interface NamedUser {
  name: string;
  surname: string;
  title: string;
  role: USER_ROLE;
  teamIndex: number; // Index into the company's team array
}

// Named users for Acme Corp (company 1)
const acmeNamedUsers: NamedUser[] = [
  {
    name: "Anna",
    surname: "Kowalska",
    title: "CEO",
    role: USER_ROLE.ADMIN,
    teamIndex: 0,
  },
  {
    name: "Piotr",
    surname: "Nowak",
    title: "Engineering Manager",
    role: USER_ROLE.MANAGER,
    teamIndex: 0,
  },
  {
    name: "Joe",
    surname: "Doe",
    title: "Senior Developer",
    role: USER_ROLE.EMPLOYEE,
    teamIndex: 0,
  },
  {
    name: "Jane",
    surname: "Smith",
    title: "Frontend Developer",
    role: USER_ROLE.EMPLOYEE,
    teamIndex: 0,
  },
  {
    name: "Michał",
    surname: "Wiśniewski",
    title: "Backend Developer",
    role: USER_ROLE.EMPLOYEE,
    teamIndex: 0,
  },
  {
    name: "Katarzyna",
    surname: "Wójcik",
    title: "QA Engineer",
    role: USER_ROLE.EMPLOYEE,
    teamIndex: 1,
  },
  {
    name: "Tomasz",
    surname: "Kamiński",
    title: "DevOps Engineer",
    role: USER_ROLE.EMPLOYEE,
    teamIndex: 2,
  },
  {
    name: "Aleksandra",
    surname: "Lewandowska",
    title: "Product Owner",
    role: USER_ROLE.EMPLOYEE,
    teamIndex: 3,
  },
  {
    name: "Marcin",
    surname: "Zieliński",
    title: "UX Designer",
    role: USER_ROLE.EMPLOYEE,
    teamIndex: 1,
  },
  {
    name: "Monika",
    surname: "Szymańska",
    title: "Data Analyst",
    role: USER_ROLE.EMPLOYEE,
    teamIndex: 2,
  },
];

// Named users for Globex Polska (company 2)
const globexNamedUsers: NamedUser[] = [
  {
    name: "Robert",
    surname: "Jankowski",
    title: "Managing Director",
    role: USER_ROLE.ADMIN,
    teamIndex: 0,
  },
  {
    name: "Ewa",
    surname: "Mazur",
    title: "Operations Manager",
    role: USER_ROLE.MANAGER,
    teamIndex: 3,
  },
  {
    name: "John",
    surname: "Kowalski",
    title: "Product Manager",
    role: USER_ROLE.EMPLOYEE,
    teamIndex: 0,
  },
  {
    name: "Maria",
    surname: "Nowak",
    title: "Software Engineer",
    role: USER_ROLE.EMPLOYEE,
    teamIndex: 1,
  },
  {
    name: "Krzysztof",
    surname: "Dąbrowski",
    title: "Client Success Lead",
    role: USER_ROLE.EMPLOYEE,
    teamIndex: 2,
  },
  {
    name: "Agnieszka",
    surname: "Kozłowska",
    title: "Account Manager",
    role: USER_ROLE.EMPLOYEE,
    teamIndex: 2,
  },
  {
    name: "Paweł",
    surname: "Jabłoński",
    title: "Technical Lead",
    role: USER_ROLE.EMPLOYEE,
    teamIndex: 1,
  },
  {
    name: "Magdalena",
    surname: "Krawczyk",
    title: "HR Specialist",
    role: USER_ROLE.EMPLOYEE,
    teamIndex: 3,
  },
  {
    name: "Adam",
    surname: "Piotrowski",
    title: "Financial Analyst",
    role: USER_ROLE.EMPLOYEE,
    teamIndex: 3,
  },
  {
    name: "Natalia",
    surname: "Grabowska",
    title: "Marketing Specialist",
    role: USER_ROLE.EMPLOYEE,
    teamIndex: 0,
  },
];

const namedUsersByCompany: Record<string, NamedUser[]> = {
  "Acme Corp": acmeNamedUsers,
  "Globex Polska": globexNamedUsers,
};

export const seedCompanies: SeedCompany[] = [
  { id: 1, name: "Acme Corp", domain: "acme.pl" },
  { id: 2, name: "Globex Polska", domain: "globex.pl" },
];

export const companyTeamGroups: Record<string, string[]> = {
  "Acme Corp": ["Engineering", "Sales", "People Ops", "Customer Experience"],
  "Globex Polska": ["Product", "Engineering", "Client Success", "Operations"],
};

const normalizeForEmail = (value: string) =>
  value
    .normalize("NFD")
    .replaceAll(/\p{M}/gu, "")
    .replaceAll(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();

const buildEmail = (name: string, surname: string, domain: string) =>
  `${normalizeForEmail(name)}.${normalizeForEmail(surname)}@${domain}`;

/**
 * Builds a deterministic list of seed users across all companies.
 * Users are synced across all microservices (users, tasks, presence, requests).
 *
 * Each user has a unique ID that is consistent across all services:
 * - Users service: User.id
 * - Tasks service: TaskUserInfo.id
 * - Presence service: CheckinUserInfo.userId
 * - Requests service: RequestUserInfo.id
 */
export function buildSeedUsers(): SeedPerson[] {
  faker.seed(2137);
  const fixtures: SeedPerson[] = [];
  let nextId = 1;

  for (const company of seedCompanies) {
    const teams = companyTeamGroups[company.name];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions
    if (!teams) {
      throw new Error(`Missing team configuration for company ${company.name}`);
    }

    const namedUsers = namedUsersByCompany[company.name];
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions
    if (!namedUsers || namedUsers.length === 0) {
      throw new Error(
        `Missing named users configuration for company ${company.name}`,
      );
    }

    // Find admin and manager from named users
    const adminUser = namedUsers.find((u) => u.role === USER_ROLE.ADMIN);
    const managerUser = namedUsers.find((u) => u.role === USER_ROLE.MANAGER);

    if (adminUser == null || managerUser == null) {
      throw new Error(
        `Company ${company.name} must have at least one ADMIN and one MANAGER in named users`,
      );
    }

    // Create admin first
    const adminId = nextId++;
    fixtures.push({
      id: adminId,
      name: adminUser.name,
      surname: adminUser.surname,
      email: buildEmail(adminUser.name, adminUser.surname, company.domain),
      title: adminUser.title,
      role: USER_ROLE.ADMIN,
      accountStatus: ACCOUNT_STATUS.VERIFIED,
      companyId: company.id,
      companyName: company.name,
      teamName: teams[adminUser.teamIndex],
      bossId: null,
      availableLeaveHours: faker.number.int({ min: 160, max: 220 }),
    });

    // Create manager (reports to admin)
    const managerId = nextId++;
    fixtures.push({
      id: managerId,
      name: managerUser.name,
      surname: managerUser.surname,
      email: buildEmail(managerUser.name, managerUser.surname, company.domain),
      title: managerUser.title,
      role: USER_ROLE.MANAGER,
      accountStatus: ACCOUNT_STATUS.VERIFIED,
      companyId: company.id,
      companyName: company.name,
      teamName: teams[managerUser.teamIndex],
      bossId: adminId,
      availableLeaveHours: faker.number.int({ min: 150, max: 200 }),
    });

    // Create remaining named employees (reports to manager)
    const employees = namedUsers.filter((u) => u.role === USER_ROLE.EMPLOYEE);
    for (const employee of employees) {
      fixtures.push({
        id: nextId,
        name: employee.name,
        surname: employee.surname,
        email: buildEmail(employee.name, employee.surname, company.domain),
        title: employee.title,
        role: USER_ROLE.EMPLOYEE,
        accountStatus: ACCOUNT_STATUS.VERIFIED,
        companyId: company.id,
        companyName: company.name,
        teamName: teams[employee.teamIndex],
        bossId: managerId,
        availableLeaveHours: faker.number.int({ min: 120, max: 200 }),
      });
      nextId += 1;
    }
  }

  return fixtures;
}

/**
 * Helper to find a seed user by name and surname.
 * Useful for tests when you need a specific user.
 *
 * @example
 * const joe = findSeedUser("Joe", "Doe");
 * // joe.id will be consistent across all services
 */
export function findSeedUser(
  name: string,
  surname: string,
): SeedPerson | undefined {
  return buildSeedUsers().find((u) => u.name === name && u.surname === surname);
}

/**
 * Get all seed users for a specific company.
 */
export function getSeedUsersByCompany(companyId: number): SeedPerson[] {
  return buildSeedUsers().filter((u) => u.companyId === companyId);
}
