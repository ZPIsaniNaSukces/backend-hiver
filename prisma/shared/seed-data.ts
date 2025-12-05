import { faker } from "@faker-js/faker/locale/pl";
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

const EMPLOYEES_PER_COMPANY = 8;

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

const buildName = () => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
});

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

    const adminName = buildName();
    const adminId = nextId++;
    fixtures.push({
      id: adminId,
      name: adminName.firstName,
      surname: adminName.lastName,
      email: buildEmail(
        adminName.firstName,
        adminName.lastName,
        company.domain,
      ),
      title: faker.person.jobTitle(),
      role: USER_ROLE.ADMIN,
      accountStatus: ACCOUNT_STATUS.VERIFIED,
      companyId: company.id,
      companyName: company.name,
      teamName: teams[0],
      bossId: null,
      availableLeaveHours: faker.number.int({ min: 160, max: 220 }),
    });

    const managerName = buildName();
    const managerId = nextId++;
    fixtures.push({
      id: managerId,
      name: managerName.firstName,
      surname: managerName.lastName,
      email: buildEmail(
        managerName.firstName,
        managerName.lastName,
        company.domain,
      ),
      title: faker.person.jobTitle(),
      role: USER_ROLE.MANAGER,
      accountStatus: ACCOUNT_STATUS.VERIFIED,
      companyId: company.id,
      companyName: company.name,
      teamName: teams[1],
      bossId: adminId,
      availableLeaveHours: faker.number.int({ min: 150, max: 200 }),
    });

    for (let index = 0; index < EMPLOYEES_PER_COMPANY; index += 1) {
      const employeeName = buildName();
      const employeeTeam = faker.helpers.arrayElement(teams);
      fixtures.push({
        id: nextId,
        name: employeeName.firstName,
        surname: employeeName.lastName,
        email: buildEmail(
          employeeName.firstName,
          employeeName.lastName,
          company.domain,
        ),
        title: faker.person.jobTitle(),
        role: USER_ROLE.EMPLOYEE,
        accountStatus: ACCOUNT_STATUS.VERIFIED,
        companyId: company.id,
        companyName: company.name,
        teamName: employeeTeam,
        bossId: managerId,
        availableLeaveHours: faker.number.int({ min: 120, max: 200 }),
      });
      nextId += 1;
    }
  }

  return fixtures;
}
