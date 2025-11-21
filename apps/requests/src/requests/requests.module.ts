import { PrismaModule } from "@app/prisma";

import { Module } from "@nestjs/common";

import { RequestsController } from "./requests.controller";
import { RequestsService } from "./requests.service";

@Module({
  imports: [PrismaModule],
  controllers: [RequestsController],
  providers: [RequestsService],
})
export class RequestsModule {}
