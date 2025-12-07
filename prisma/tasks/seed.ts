import { fakerPL as faker } from "@faker-js/faker";

import type { Prisma } from "../../generated/prisma/tasks-client";
import {
  PrismaClient,
  TASK_STATUS,
  TASK_TYPE,
} from "../../generated/prisma/tasks-client";
import { buildSeedUsers } from "../shared/seed-data";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TASKS_DATABASE_URL,
    },
  },
});

async function main() {
  console.warn("Seeding tasks database...");

  // Clean up existing data
  await prisma.task.deleteMany();
  await prisma.taskUserInfo.deleteMany();

  const users = buildSeedUsers();

  // Create task user infos for existing users
  await prisma.taskUserInfo.createMany({
    data: users.map((u) => ({
      id: u.id,
      bossId: u.bossId,
      companyId: u.companyId,
      name: u.name,
      lastName: u.surname,
      title: u.title,
    })),
  });

  // Create sample tasks
  const tasksData: Prisma.TaskCreateManyInput[] = [];
  for (const user of users) {
    // Generate 2-5 tasks where this user is involved
    const numberOfTasks = faker.number.int({ min: 2, max: 5 });

    const colleagues = users.filter(
      (u) => u.companyId === user.companyId && u.id !== user.id,
    );

    if (colleagues.length === 0) {
      continue;
    }

    for (let index = 0; index < numberOfTasks; index++) {
      const otherPerson = faker.helpers.arrayElement(colleagues);

      // Randomly decide if user is reporter or assignee
      const isReporter = faker.datatype.boolean();
      const reporterId = isReporter ? user.id : otherPerson.id;
      const assigneeId = isReporter ? otherPerson.id : user.id;

      tasksData.push({
        title: faker.lorem.sentence({ min: 3, max: 6 }),
        description: faker.lorem.paragraph(),
        status: faker.helpers.enumValue(TASK_STATUS),
        type: faker.helpers.enumValue(TASK_TYPE),
        reporterId,
        assigneeId,
        dueDate: faker.date.future(),
      });
    }
  }

  await prisma.task.createMany({
    data: tasksData,
  });

  console.warn("Tasks database seeded successfully!");
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
