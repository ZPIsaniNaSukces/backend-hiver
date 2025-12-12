/**
 * Test script for notification sagas
 *
 * This script tests 3 sagas by emitting Kafka events:
 * 1. Leave request approved - sends email notification to user
 * 2. Task assigned - sends email notification to assigned user
 * 3. User deleted - sends email notifications to all admins
 *
 * To run:
 * 1. Make sure docker-compose services are running: docker-compose up -d
 * 2. Run: ts-node test-sagas.ts
 * 3. Check emails in MailHog UI: http://localhost:8025
 */
import { Kafka } from "kafkajs";

// Kafka configuration
const kafka = new Kafka({
  clientId: "saga-test-client",
  brokers: ["localhost:9092"],
});

const producer = kafka.producer();

async function testLeaveRequestApprovedSaga() {
  console.log("\n📧 Testing Leave Request Approved Saga...");

  const event = {
    userId: 5, // Tomasz from seed data
    userName: "Tomasz",
    userEmail: "tomasz@example.com",
    startsAt: new Date("2025-12-23"),
    endsAt: new Date("2025-12-27"),
    reason: "Christmas vacation",
    approverName: "Anna Kowalska",
  };

  await producer.send({
    topic: "leaveRequestApproved",
    messages: [
      {
        value: JSON.stringify(event),
      },
    ],
  });

  console.log("✅ Leave request approved event sent!");
  console.log("   User: tomasz@example.com");
  console.log("   Dates: Dec 23-27, 2025");
}

async function testTaskAssignedSaga() {
  console.log("\n📧 Testing Task Assigned Saga...");

  const event = {
    taskId: 999,
    taskTitle: "Test Task for Saga",
    taskDescription:
      "This is a test task to verify the saga is working correctly",
    assigneeId: 7, // Michał from seed data
    assigneeEmail: "michal@example.com",
    assigneeName: "Michał",
    reporterName: "Anna Kowalska",
    dueDate: new Date("2025-12-20"),
  };

  await producer.send({
    topic: "taskAssigned",
    messages: [
      {
        value: JSON.stringify(event),
      },
    ],
  });

  console.log("✅ Task assigned event sent!");
  console.log("   Assignee: michal@example.com");
  console.log("   Task: Test Task for Saga");
}

async function testUserDeletedAdminNotificationSaga() {
  console.log("\n📧 Testing User Deleted Admin Notification Saga...");

  const event = {
    deletedUserId: 999,
    deletedUserName: "John Test User",
    deletedUserEmail: "john.test@example.com",
    deletedUserRole: "EMPLOYEE",
    companyId: 1,
    deletedByUserId: 1,
    deletedByUserName: "Jan Nowak",
  };

  await producer.send({
    topic: "userDeletedAdminNotification",
    messages: [
      {
        value: JSON.stringify(event),
      },
    ],
  });

  console.log("✅ User deleted notification event sent!");
  console.log("   Deleted user: john.test@example.com");
  console.log("   All admins in company 1 will be notified");
}

async function main() {
  try {
    console.log("🚀 Starting Saga Tests...");
    console.log("📬 MailHog UI available at: http://localhost:8025");
    console.log("");

    // Connect to Kafka
    await producer.connect();
    console.log("✅ Connected to Kafka");

    // Run tests with delays between them
    await testLeaveRequestApprovedSaga();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await testTaskAssignedSaga();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    await testUserDeletedAdminNotificationSaga();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("\n✅ All events sent successfully!");
    console.log("\n📬 Check MailHog UI for emails: http://localhost:8025");
    console.log("   Expected emails:");
    console.log("   1. Leave request approval to tomasz@example.com");
    console.log("   2. Task assignment to michal@example.com");
    console.log("   3. User deletion notifications to all admins in company 1");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await producer.disconnect();
    console.log("\n✅ Disconnected from Kafka");
  }
}

// Run the tests
main()
  .then(() => {
    console.log("\n🎉 Test completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Test failed:", error);
    process.exit(1);
  });
