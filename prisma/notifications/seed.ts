import { PrismaClient } from "../../generated/prisma/notifications-client";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.NOTIFICATIONS_DATABASE_URL,
    },
  },
});

async function main() {
  console.log("Seeding notifications database...");

  // Clean up existing data
  await prisma.notification.deleteMany();
  await prisma.notificationTemplate.deleteMany();
  await prisma.notificationUserInfo.deleteMany();

  // Create notification user infos for existing users
  // These would normally be created via Kafka events
  await prisma.notificationUserInfo.createMany({
    data: [
      {
        id: 1,
        email: "admin@example.com",
        phone: "+48123456789",
        companyId: 1,
        pushTokens: [],
      },
      {
        id: 2,
        email: "manager@example.com",
        phone: "+48123456788",
        companyId: 1,
        pushTokens: [],
      },
      {
        id: 3,
        email: "employee1@example.com",
        phone: "+48123456787",
        companyId: 1,
        pushTokens: [],
      },
      {
        id: 4,
        email: "employee2@example.com",
        phone: "+48123456786",
        companyId: 1,
        pushTokens: [],
      },
    ],
  });

  // Create notification templates
  await prisma.notificationTemplate.createMany({
    data: [
      {
        name: "welcome_email",
        type: "EMAIL",
        subject: "Welcome to Hiver!",
        template:
          "Hello {{name}},\n\nWelcome to Hiver! We're excited to have you on board.\n\nBest regards,\nThe Hiver Team",
        description: "Welcome email sent to new users",
      },
      {
        name: "leave_request_approved",
        type: "EMAIL",
        subject: "Leave Request Approved",
        template:
          "Hello {{name}},\n\nYour leave request from {{startDate}} to {{endDate}} has been approved.\n\nBest regards,\nThe Hiver Team",
        description: "Notification sent when leave request is approved",
      },
      {
        name: "task_assigned",
        type: "PUSH",
        subject: "New Task Assigned",
        template: "You have been assigned a new task: {{taskTitle}}",
        description: "Push notification sent when a task is assigned",
      },
      {
        name: "checkin_reminder",
        type: "SMS",
        template:
          "Don't forget to check in today! Visit the Hiver app to mark your presence.",
        description: "SMS reminder to check in",
      },
    ],
  });

  console.log("Notifications database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
