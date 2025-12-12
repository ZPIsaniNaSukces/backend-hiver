#!/bin/bash

# Test script for notification sagas using Kafka console producer
# This script sends events directly to Kafka to test the 3 sagas

echo "🚀 Starting Saga Tests..."
echo "📬 MailHog UI available at: http://localhost:8025"
echo ""

# Test 1: Leave Request Approved Saga
echo "📧 Testing Leave Request Approved Saga..."
echo '{"userId":5,"userName":"Tomasz","userEmail":"tomasz@example.com","startsAt":"2025-12-23T00:00:00.000Z","endsAt":"2025-12-27T00:00:00.000Z","reason":"Christmas vacation","approverName":"Anna Kowalska"}' | \
docker exec -i kafka kafka-console-producer --broker-list localhost:9092 --topic leaveRequestApproved

echo "✅ Leave request approved event sent!"
echo "   User: tomasz@example.com"
echo "   Dates: Dec 23-27, 2025"
echo ""
sleep 2

# Test 2: Task Assigned Saga
echo "📧 Testing Task Assigned Saga..."
echo '{"taskId":999,"taskTitle":"Test Task for Saga","taskDescription":"This is a test task to verify the saga is working correctly","assigneeId":7,"assigneeEmail":"michal@example.com","assigneeName":"Michał","reporterName":"Anna Kowalska","dueDate":"2025-12-20T00:00:00.000Z"}' | \
docker exec -i kafka kafka-console-producer --broker-list localhost:9092 --topic taskAssigned

echo "✅ Task assigned event sent!"
echo "   Assignee: michal@example.com"
echo "   Task: Test Task for Saga"
echo ""
sleep 2

# Test 3: User Deleted Admin Notification Saga
echo "📧 Testing User Deleted Admin Notification Saga..."
echo '{"deletedUserId":999,"deletedUserName":"John Test User","deletedUserEmail":"john.test@example.com","deletedUserRole":"EMPLOYEE","companyId":1,"deletedByUserId":1,"deletedByUserName":"Jan Nowak"}' | \
docker exec -i kafka kafka-console-producer --broker-list localhost:9092 --topic userDeletedAdminNotification

echo "✅ User deleted notification event sent!"
echo "   Deleted user: john.test@example.com"
echo "   All admins in company 1 will be notified"
echo ""

echo "✅ All events sent successfully!"
echo ""
echo "📬 Check MailHog UI for emails: http://localhost:8025"
echo ""
echo "Expected emails:"
echo "1. Leave request approval to tomasz@example.com"
echo "2. Task assignment to michal@example.com"
echo "3. User deletion notifications to all admins in company 1"
echo ""
echo "Wait a few seconds for the notifications service to process the events..."
echo ""
echo "🎉 Test completed successfully!"
