import { FirebaseModule } from "@app/firebase";
import { MailModule } from "@app/mail";
import { PrismaModule } from "@app/prisma";
import { PushNotificationsModule } from "@app/push-notifications";

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
    MailModule,
    FirebaseModule,
    PushNotificationsModule,
  ],
  controllers: [NotificationsController, NotificationsEventsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
