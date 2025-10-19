import { Module } from "@nestjs/common";

import { CompaniesModule } from "./companies/companies.module";
import { TeamsModule } from "./teams/teams.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [UsersModule, TeamsModule, CompaniesModule],
})
export class UsersAppModule {}
