import { HIERARCHY_SERVICE } from "@app/auth";
import { PrismaModule } from "@app/prisma";

import { Module } from "@nestjs/common";

import { LeaveRequestsHierarchyService } from "./leave-requests-hierarchy.service";
import { LeaveRequestsController } from "./leave-requests.controller";
import { LeaveRequestsService } from "./leave-requests.service";

@Module({
  imports: [PrismaModule],
  controllers: [LeaveRequestsController],
  providers: [
    LeaveRequestsService,
    LeaveRequestsHierarchyService,
    {
      provide: HIERARCHY_SERVICE,
      useExisting: LeaveRequestsHierarchyService,
    },
  ],
})
export class LeaveRequestsModule {}
