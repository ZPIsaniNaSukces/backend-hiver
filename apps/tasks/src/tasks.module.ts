import { AuthClientModule } from "@app/auth";
import { PrismaModule } from "@app/prisma";

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { TASKS_PRISMA, TasksPrismaClient } from "./prisma/prisma.constants";
import { TasksEventsController } from "./tasks-events.controller";
import { TasksController } from "./tasks.controller";
import { TasksService } from "./tasks.service";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule.forRoot({
      provide: TASKS_PRISMA,
      client: TasksPrismaClient,
      databaseUrlEnv: "TASKS_DATABASE_URL",
      global: true,
    }),
    AuthClientModule,
  ],
  controllers: [TasksController, TasksEventsController],
  providers: [TasksService],
})
export class TasksModule {}
