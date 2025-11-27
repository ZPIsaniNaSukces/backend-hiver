import { HIERARCHY_SERVICE } from "@app/auth";
import { PrismaModule } from "@app/prisma";

import { Module } from "@nestjs/common";

import { RequestsHierarchyService } from "./requests-hierarchy.service";
import { RequestsController } from "./requests.controller";
import { RequestsService } from "./requests.service";

@Module({
  imports: [PrismaModule],
  controllers: [RequestsController],
  providers: [
    RequestsService,
    RequestsHierarchyService,
    {
      provide: HIERARCHY_SERVICE,
      useExisting: RequestsHierarchyService,
    },
  ],
})
export class RequestsModule {}
