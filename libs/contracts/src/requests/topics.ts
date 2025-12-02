export enum LeaveRequestsMessageTopic {
  CREATE = "createLeaveRequest",
  FIND_ALL = "findAllLeaveRequests",
  FIND_ONE = "findOneLeaveRequest",
  UPDATE = "updateLeaveRequest",
  REMOVE = "removeLeaveRequest",
}

export const LEAVE_REQUESTS_MESSAGE_TOPICS: LeaveRequestsMessageTopic[] = [
  LeaveRequestsMessageTopic.CREATE,
  LeaveRequestsMessageTopic.FIND_ALL,
  LeaveRequestsMessageTopic.FIND_ONE,
  LeaveRequestsMessageTopic.UPDATE,
  LeaveRequestsMessageTopic.REMOVE,
];
