import { PrismaClient, USER_ROLE } from "@prisma/client";
import type { Company, Team } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

const hashPassword = async (raw: string) => {
  const saltRounds = 12;
  return bcrypt.hash(raw, saltRounds);
};

async function main() {
  console.warn("Start seeding ...");

  // Clear existing data and restart auto-incrementing identifiers for deterministic seeding
  await prisma.$executeRaw`TRUNCATE TABLE "User", "Team", "Company" RESTART IDENTITY CASCADE`;

  // Basic companies
  const companiesData: { name: string; domain?: string }[] = [
    { name: "Acme Corp", domain: "acme.com" },
    { name: "Globex", domain: "globex.com" },
  ];

  const companies: Company[] = [];
  for (const c of companiesData) {
    const company = await prisma.company.create({ data: c });
    companies.push(company);
  }

  // Teams per company
  const teamsData = companies.flatMap((company) => [
    { name: "Engineering", companyId: company.id },
    { name: "Sales", companyId: company.id },
  ]);

  const teams: Team[] = [];
  for (const t of teamsData) {
    const team = await prisma.team.create({
      data: { name: t.name, companyId: t.companyId },
    });
    teams.push(team);
  }

  // Users covering all roles
  const usersData = [
    {
      name: "Alice",
      surname: "Admin",
      email: "alice.admin@acme.com",
      password: "ChangeMe123!",
      role: USER_ROLE.ADMIN,
      companyName: "Acme Corp",
      teamName: "Engineering",
    },
    {
      name: "Martin",
      surname: "Manager",
      email: "martin.manager@acme.com",
      password: "ChangeMe123!",
      role: USER_ROLE.MANAGER,
      companyName: "Acme Corp",
      teamName: "Sales",
    },
    {
      name: "Eve",
      surname: "Employee",
      email: "eve.employee@globex.com",
      password: "ChangeMe123!",
      role: USER_ROLE.EMPLOYEE,
      companyName: "Globex",
      teamName: "Engineering",
    },
  ];

  for (const u of usersData) {
    const company = companies.find((c) => c.name === u.companyName);
    if (company == null) {
      throw new Error(`Seed error: company not found: ${u.companyName}`);
    }
    const team = teams.find(
      (t) => t.name === u.teamName && t.companyId === company.id,
    );
    const hashed = await hashPassword(u.password);

    await prisma.user.create({
      data: {
        name: u.name,
        surname: u.surname,
        email: u.email,
        password: hashed,
        role: u.role,
        companyId: company.id,
        teams:
          team === undefined
            ? undefined
            : {
                connect: [{ id: team.id }],
              },
      },
    });
  }

  console.warn("Seeding finished.");
}

main()
  .catch((error: unknown) => {
    console.error(error);
    throw error;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
