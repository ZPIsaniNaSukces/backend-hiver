import {
  NotificationsMessageTopic,
  SendNotificationDto,
  UserCreatedNotificationEventDto,
  UserRemovedNotificationEventDto,
  UserUpdatedNotificationEventDto,
  UsersMessageTopic,
} from "@app/contracts";

import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";

import { NotificationsService } from "./notifications.service";

@Controller()
export class NotificationsEventsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // User lifecycle events
  @EventPattern(UsersMessageTopic.CREATE)
  async handleUserCreated(
    @Payload() event: UserCreatedNotificationEventDto,
  ): Promise<void> {
    await this.notificationsService.handleUserCreated(event);
  }

  @EventPattern(UsersMessageTopic.UPDATE)
  async handleUserUpdated(
    @Payload() event: UserUpdatedNotificationEventDto,
  ): Promise<void> {
    await this.notificationsService.handleUserUpdated(event);
  }

  @EventPattern(UsersMessageTopic.REMOVE)
  async handleUserRemoved(
    @Payload() event: UserRemovedNotificationEventDto,
  ): Promise<void> {
    await this.notificationsService.handleUserRemoved(event);
  }

  // Notification sending events
  @EventPattern(NotificationsMessageTopic.SEND)
  async handleSendNotification(
    @Payload() dto: SendNotificationDto,
  ): Promise<void> {
    await this.notificationsService.sendNotification(dto);
  }
}
