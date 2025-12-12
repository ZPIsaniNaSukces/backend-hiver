export enum NotificationsMessageTopic {
  SEND = "sendNotification",
  LEAVE_REQUEST_APPROVED = "leaveRequestApproved",
  USER_DELETED_ADMIN_NOTIFICATION = "userDeletedAdminNotification",
}

export const NOTIFICATIONS_MESSAGE_TOPICS: NotificationsMessageTopic[] = [
  NotificationsMessageTopic.SEND,
  NotificationsMessageTopic.LEAVE_REQUEST_APPROVED,
  NotificationsMessageTopic.USER_DELETED_ADMIN_NOTIFICATION,
];
