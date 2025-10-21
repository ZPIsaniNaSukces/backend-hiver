import { AuthModule } from "@app/auth";
import { PrismaModule } from "@app/prisma";

import { Module } from "@nestjs/common";

import { CompaniesModule } from "./companies/companies.module";
import { TeamsModule } from "./teams/teams.module";
import { UsersAppController } from "./users-app.controller";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    TeamsModule,
    CompaniesModule,
    AuthModule,
  ],
  controllers: [UsersAppController],
  providers: [],
})
export class UsersAppModule {}
