import {
  PrismaClient,
  TASK_STATUS,
  TASK_TYPE,
} from "../../generated/prisma/tasks-client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TASKS_DATABASE_URL,
    },
  },
});

async function main() {
  console.log("Seeding tasks database...");

  // Clean up existing data
  await prisma.task.deleteMany();
  await prisma.taskUserInfo.deleteMany();

  // Create task user infos for existing users
  // These would normally be created via Kafka events
  await prisma.taskUserInfo.createMany({
    data: [
      {
        id: 1,
        bossId: null,
        companyId: 1,
        name: "Alice",
        lastName: "Admin",
        title: "CTO",
      },
      {
        id: 2,
        bossId: 1,
        companyId: 1,
        name: "Mark",
        lastName: "Manager",
        title: "Engineering Manager",
      },
      {
        id: 3,
        bossId: 2,
        companyId: 1,
        name: "Eve",
        lastName: "Engineer",
        title: "Senior Developer",
      },
      {
        id: 4,
        bossId: 2,
        companyId: 1,
        name: "Sam",
        lastName: "Specialist",
        title: "Developer",
      },
    ],
  });

  // Create sample tasks
  await prisma.task.createMany({
    data: [
      {
        title: "Setup project infrastructure",
        description: "Configure CI/CD pipeline and deployment",
        status: TASK_STATUS.TODO,
        type: TASK_TYPE.FEATURE,
        reporterId: 1,
        assigneeId: 2,
        dueDate: new Date("2025-12-01"),
      },
      {
        title: "Implement user authentication",
        description: "Add JWT authentication and authorization",
        status: TASK_STATUS.DONE,
        type: TASK_TYPE.FEATURE,
        reporterId: 2,
        assigneeId: 3,
        dueDate: new Date("2025-11-15"),
      },
      {
        title: "Design database schema",
        description: "Create ERD and Prisma schema",
        status: TASK_STATUS.TODO,
        type: TASK_TYPE.DOCUMENTATION,
        reporterId: 1,
        assigneeId: 4,
        dueDate: new Date("2025-12-10"),
      },
    ],
  });

  console.log("Tasks database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
