export enum UsersMessageTopic {
  CREATE = "createUser",
  FIND_ALL = "findAllUsers",
  FIND_ONE = "findOneUser",
  UPDATE = "updateUser",
  REMOVE = "removeUser",
}

export const USERS_MESSAGE_TOPICS: UsersMessageTopic[] = [
  UsersMessageTopic.CREATE,
  UsersMessageTopic.FIND_ALL,
  UsersMessageTopic.FIND_ONE,
  UsersMessageTopic.UPDATE,
  UsersMessageTopic.REMOVE,
];
