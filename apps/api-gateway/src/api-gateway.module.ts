import { AuthModule } from "@app/auth";

import { Module } from "@nestjs/common";
import { ClientsModule, Transport } from "@nestjs/microservices";

import { CompaniesModule } from "./companies/companies.module";
import { TeamsModule } from "./teams/teams.module";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [AuthModule, UsersModule, TeamsModule, CompaniesModule],
  controllers: [],
  providers: [],
})
export class ApiGatewayModule {}
