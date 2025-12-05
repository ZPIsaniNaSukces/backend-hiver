import { PrismaClient } from "@prisma/client";
import type { Company, Team } from "@prisma/client";
import * as bcrypt from "bcrypt";

import {
  buildSeedUsers,
  companyTeamGroups,
  seedCompanies,
} from "../shared/seed-data";

const prisma = new PrismaClient();

const hashPassword = async (raw: string) => {
  const saltRounds = 12;
  return bcrypt.hash(raw, saltRounds);
};

async function main() {
  console.warn("Start seeding ...");

  // Clear existing data and restart auto-incrementing identifiers for deterministic seeding
  await prisma.$executeRaw`TRUNCATE TABLE "User", "Team", "Company", "LeaveRequest" RESTART IDENTITY CASCADE`;

  // Basic companies
  const companies: Company[] = [];
  for (const c of seedCompanies) {
    const company = await prisma.company.create({
      data: { name: c.name, domain: c.domain },
    });
    companies.push(company);
  }

  // Teams per company
  const teams: Team[] = [];
  for (const company of companies) {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unnecessary-condition
    const teamNames = companyTeamGroups[company.name] || [];
    for (const name of teamNames) {
      const team = await prisma.team.create({
        data: { name, companyId: company.id },
      });
      teams.push(team);
    }
  }

  // Users covering all roles
  const usersData = buildSeedUsers();

  for (const u of usersData) {
    const company = companies.find((c) => c.name === u.companyName);
    if (company == null) {
      throw new Error(`Seed error: company not found: ${u.companyName}`);
    }
    const team = teams.find(
      (t) => t.name === u.teamName && t.companyId === company.id,
    );
    const hashed = await hashPassword("ChangeMe123!");

    await prisma.user.create({
      data: {
        name: u.name,
        surname: u.surname,
        email: u.email,
        password: hashed,
        role: u.role,
        companyId: company.id,
        teams: team == null ? undefined : { connect: [{ id: team.id }] },
        accountStatus: u.accountStatus,
        title: u.title,
        bossId: u.bossId,
      },
    });
  }

  console.warn("Seeding users finished.");
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
