import { PrismaModule } from "@app/prisma";

import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { NotificationsEventsController } from "./notifications-events.controller";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";
import {
  NOTIFICATIONS_PRISMA,
  NotificationsPrismaClient,
} from "./prisma/prisma.constants";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule.forRoot({
      provide: NOTIFICATIONS_PRISMA,
      client: NotificationsPrismaClient,
      databaseUrlEnv: "NOTIFICATIONS_DATABASE_URL",
      global: true,
    }),
  ],
  controllers: [NotificationsController, NotificationsEventsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
