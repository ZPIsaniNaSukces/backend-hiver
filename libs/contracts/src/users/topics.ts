export enum UsersMessageTopic {
  CREATE = "createUser",
  UPDATE = "updateUser",
  REMOVE = "removeUser",
}

export const USERS_MESSAGE_TOPICS: UsersMessageTopic[] = [
  UsersMessageTopic.CREATE,
  UsersMessageTopic.UPDATE,
  UsersMessageTopic.REMOVE,
];
