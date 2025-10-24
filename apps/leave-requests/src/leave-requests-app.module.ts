import { AuthModule } from "@app/auth";
import { PrismaModule } from "@app/prisma";

import { Module } from "@nestjs/common";

import { LeaveRequestsAppController } from "./leave-requests-app.controller";
import { LeaveRequestsModule } from "./leave-requests/leave-requests.module";

@Module({
  imports: [PrismaModule, LeaveRequestsModule, AuthModule],
  controllers: [LeaveRequestsAppController],
  providers: [],
})
export class LeaveRequestsAppModule {}
