import { FirebaseModule } from "@app/firebase";

import { Module } from "@nestjs/common";

import { PushNotificationsService } from "./push-notifications.service";

@Module({
  imports: [FirebaseModule],
  providers: [PushNotificationsService],
  exports: [PushNotificationsService],
})
export class PushNotificationsModule {}
