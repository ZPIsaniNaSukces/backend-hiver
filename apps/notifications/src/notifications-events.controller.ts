import {
  NotificationsMessageTopic,
  SendNotificationDto,
  UserCreatedEventDto,
  UserRemovedEventDto,
  UserUpdatedEventDto,
  UsersMessageTopic,
} from "@app/contracts";

import { Controller, Logger } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";

import { NotificationsService } from "./notifications.service";

@Controller()
export class NotificationsEventsController {
  private readonly logger = new Logger(NotificationsEventsController.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @EventPattern(UsersMessageTopic.CREATE)
  async handleUserCreated(
    @Payload() event: UserCreatedEventDto,
  ): Promise<void> {
    await this.notificationsService.handleUserCreated(event);
  }

  @EventPattern(UsersMessageTopic.UPDATE)
  async handleUserUpdated(
    @Payload() event: UserUpdatedEventDto,
  ): Promise<void> {
    await this.notificationsService.handleUserUpdated(event);
  }

  @EventPattern(UsersMessageTopic.REMOVE)
  async handleUserRemoved(
    @Payload() event: UserRemovedEventDto,
  ): Promise<void> {
    await this.notificationsService.handleUserRemoved(event);
  }

  @EventPattern(NotificationsMessageTopic.SEND)
  async handleSendNotification(
    @Payload() dto: SendNotificationDto,
  ): Promise<void> {
    try {
      this.logger.log(
        `Received sendNotification event: ${JSON.stringify(dto)}`,
      );
      await this.notificationsService.sendNotification(dto);
      this.logger.log(
        `Successfully sent notification for user ${String(dto.userId)}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle sendNotification for user ${String(dto.userId)}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error; // kafka retry, nice trick
    }
  }
}
