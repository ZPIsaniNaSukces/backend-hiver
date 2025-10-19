export enum CompaniesMessageTopic {
  CREATE = "createCompany",
  FIND_ALL = "findAllCompanies",
  FIND_ONE = "findOneCompany",
  UPDATE = "updateCompany",
  REMOVE = "removeCompany",
}

export const COMPANIES_MESSAGE_TOPICS: CompaniesMessageTopic[] = [
  CompaniesMessageTopic.CREATE,
  CompaniesMessageTopic.FIND_ALL,
  CompaniesMessageTopic.FIND_ONE,
  CompaniesMessageTopic.UPDATE,
  CompaniesMessageTopic.REMOVE,
];
