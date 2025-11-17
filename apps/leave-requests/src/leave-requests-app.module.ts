import { AuthClientModule } from "@app/auth";
import { PrismaModule } from "@app/prisma";

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { LeaveRequestsAppController } from "./leave-requests-app.controller";
import { LeaveRequestsModule } from "./leave-requests/leave-requests.module";
import {
  LEAVE_REQUESTS_PRISMA,
  LeaveRequestsPrismaClient,
} from "./prisma/prisma.constants";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule.forRoot({
      provide: LEAVE_REQUESTS_PRISMA,
      client: LeaveRequestsPrismaClient,
      databaseUrlEnv: "LEAVE_REQUESTS_DATABASE_URL",
      global: true,
    }),
    AuthClientModule,
    LeaveRequestsModule,
  ],
  controllers: [LeaveRequestsAppController],
  providers: [],
})
export class LeaveRequestsAppModule {}
