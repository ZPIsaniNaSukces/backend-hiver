import { AuthClientModule } from "@app/auth";
import { PrismaModule } from "@app/prisma";

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import {
  REQUESTS_PRISMA,
  RequestsPrismaClient,
} from "./prisma/prisma.constants";
import { RequestsAppController } from "./requests-app.controller";
import { RequestsModule } from "./requests/requests.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule.forRoot({
      provide: REQUESTS_PRISMA,
      client: RequestsPrismaClient,
      databaseUrlEnv: "LEAVE_REQUESTS_DATABASE_URL",
      global: true,
    }),
    AuthClientModule,
    RequestsModule,
  ],
  controllers: [RequestsAppController],
  providers: [],
})
export class RequestsAppModule {}
