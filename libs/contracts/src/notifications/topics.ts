export enum NotificationsMessageTopic {
  SEND = "sendNotification",
  LEAVE_REQUEST_APPROVED = "leaveRequestApproved",
}

export const NOTIFICATIONS_MESSAGE_TOPICS: NotificationsMessageTopic[] = [
  NotificationsMessageTopic.SEND,
  NotificationsMessageTopic.LEAVE_REQUEST_APPROVED,
];
