import { AuthModule } from "@app/auth";
import { PrismaModule } from "@app/prisma";

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { CompaniesModule } from "./companies/companies.module";
import { TeamsModule } from "./teams/teams.module";
import { UsersAppController } from "./users-app.controller";
import { UsersModule } from "./users/users.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
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
