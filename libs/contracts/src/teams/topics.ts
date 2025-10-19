export enum TeamsMessageTopic {
  CREATE = "createTeam",
  FIND_ALL = "findAllTeams",
  FIND_ONE = "findOneTeam",
  UPDATE = "updateTeam",
  REMOVE = "removeTeam",
}

export const TEAMS_MESSAGE_TOPICS: TeamsMessageTopic[] = [
  TeamsMessageTopic.CREATE,
  TeamsMessageTopic.FIND_ALL,
  TeamsMessageTopic.FIND_ONE,
  TeamsMessageTopic.UPDATE,
  TeamsMessageTopic.REMOVE,
];
