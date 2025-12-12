import {
  LeaveRequestApprovedEventDto,
  NotificationsMessageTopic,
  SendNotificationDto,
  TaskAssignedEventDto,
  TasksMessageTopic,
  UserCreatedEventDto,
  UserDeletedAdminNotificationEventDto,
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

  @EventPattern(NotificationsMessageTopic.LEAVE_REQUEST_APPROVED)
  async handleLeaveRequestApproved(
    @Payload() event: LeaveRequestApprovedEventDto,
  ): Promise<void> {
    try {
      this.logger.log(
        `Received leave request approved event for user ${String(event.userId)}`,
      );
      await this.notificationsService.handleLeaveRequestApproved(event);
      this.logger.log(
        `Successfully processed leave request approval notification for user ${String(event.userId)}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle leave request approval for user ${String(event.userId)}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error; // kafka retry, nice trick
    }
  }

  @EventPattern(TasksMessageTopic.TASK_ASSIGNED)
  async handleTaskAssigned(
    @Payload() event: TaskAssignedEventDto,
  ): Promise<void> {
    try {
      this.logger.log(
        `Received task assigned event for user ${String(event.assigneeId)}`,
      );
      await this.notificationsService.handleTaskAssigned(event);
      this.logger.log(
        `Successfully processed task assignment notification for user ${String(event.assigneeId)}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle task assignment for user ${String(event.assigneeId)}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error; // kafka retry, nice trick
    }
  }

  @EventPattern(NotificationsMessageTopic.USER_DELETED_ADMIN_NOTIFICATION)
  async handleUserDeletedAdminNotification(
    @Payload() event: UserDeletedAdminNotificationEventDto,
  ): Promise<void> {
    try {
      this.logger.log(
        `Received user deleted notification event for user ${String(event.deletedUserId)}`,
      );
      await this.notificationsService.handleUserDeletedAdminNotification(event);
      this.logger.log(
        `Successfully processed user deletion notification for user ${String(event.deletedUserId)}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to handle user deletion notification for user ${String(event.deletedUserId)}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw error; // kafka retry, nice trick
    }
  }
}
