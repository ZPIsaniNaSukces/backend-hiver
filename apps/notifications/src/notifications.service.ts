import {
  NotificationStatus,
  NotificationType,
  SendNotificationDto,
  UserCreatedNotificationEventDto,
  UserRemovedNotificationEventDto,
  UserUpdatedNotificationEventDto,
} from "@app/contracts";
import type {
  Notification,
  NotificationUserInfo,
  Prisma,
} from "@generated/notifications";

import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";

import {
  NOTIFICATIONS_PRISMA,
  NotificationsPrismaClient,
} from "./prisma/prisma.constants";

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @Inject(NOTIFICATIONS_PRISMA)
    private readonly prisma: NotificationsPrismaClient,
  ) {}

  // User lifecycle event handlers
  async handleUserCreated(
    event: UserCreatedNotificationEventDto,
  ): Promise<void> {
    await this.prisma.notificationUserInfo.create({
      data: {
        id: event.id,
        email: event.email,
        phone: event.phone,
        companyId: event.companyId,
        pushTokens: [],
      },
    });

    this.logger.log(`User info created for user ${String(event.id)}`);
  }

  async handleUserUpdated(
    event: UserUpdatedNotificationEventDto,
  ): Promise<void> {
    const data: Prisma.NotificationUserInfoUpdateInput = {};

    if (event.email !== undefined) {
      data.email = event.email;
    }
    if (event.phone !== undefined) {
      data.phone = event.phone;
    }
    if (event.companyId !== undefined) {
      data.companyId = event.companyId;
    }

    await this.prisma.notificationUserInfo.update({
      where: { id: event.id },
      data,
    });

    this.logger.log(`User info updated for user ${String(event.id)}`);
  }

  async handleUserRemoved(
    event: UserRemovedNotificationEventDto,
  ): Promise<void> {
    await this.prisma.notificationUserInfo.delete({
      where: { id: event.id },
    });

    this.logger.log(`User info removed for user ${String(event.id)}`);
  }

  // Notification sending
  async sendNotification(dto: SendNotificationDto): Promise<Notification> {
    // Get user info
    const userInfo = await this.prisma.notificationUserInfo.findUnique({
      where: { id: dto.userId },
    });

    if (userInfo == null) {
      throw new NotFoundException(
        `User info not found for user ${String(dto.userId)}`,
      );
    }

    // Create notification record
    const notification = await this.prisma.notification.create({
      data: {
        userId: dto.userId,
        type: dto.type,
        subject: dto.subject,
        message: dto.message,
        metadata: dto.metadata ?? {},
        status: NotificationStatus.PENDING,
      },
    });

    // Send notification based on type
    try {
      switch (dto.type) {
        case NotificationType.EMAIL:
          await this.sendEmail(userInfo, notification);
          break;
        case NotificationType.SMS:
          await this.sendSms(userInfo, notification);
          break;
        case NotificationType.PUSH:
          await this.sendPushNotification(userInfo, notification);
          break;
      }

      // Update status to sent
      return await this.prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: NotificationStatus.SENT,
          sentAt: new Date(),
        },
      });
    } catch (error) {
      // Update status to failed
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: NotificationStatus.FAILED,
          errorMessage:
            error instanceof Error ? error.message : "Unknown error",
        },
      });

      this.logger.error(
        `Failed to send ${dto.type} notification to user ${String(dto.userId)}`,
        error instanceof Error ? error.stack : undefined,
      );

      throw error;
    }
  }

  private async sendEmail(
    userInfo: NotificationUserInfo,
    notification: Notification,
  ): Promise<void> {
    if (userInfo.email == null) {
      throw new Error("User does not have an email address");
    }

    this.logger.log(
      `Sending email to ${userInfo.email}: ${notification.subject ?? "No subject"}`,
    );

    // TODO: Implement email sending logic using @nestjs-modules/mailer

    this.logger.log(`Email sent successfully to ${userInfo.email}`);
  }

  private async sendSms(
    userInfo: NotificationUserInfo,
    notification: Notification,
  ): Promise<void> {
    if (userInfo.phone == null) {
      throw new Error("User does not have a phone number");
    }

    this.logger.log(
      `Sending SMS to ${userInfo.phone}: ${notification.message.substring(0, 50)}...`,
    );

    // TODO: Implement SMS sending logic using AWS SNS

    this.logger.log(`SMS sent successfully to ${userInfo.phone}`);
  }

  private async sendPushNotification(
    userInfo: NotificationUserInfo,
    notification: Notification,
  ): Promise<void> {
    if (userInfo.pushTokens.length === 0) {
      throw new Error("User does not have any push notification tokens");
    }

    this.logger.log(
      `Sending push notification to ${String(userInfo.pushTokens.length)} device(s): ${notification.subject ?? "No subject"}`,
    );

    // TODO: Implement push notification logic using... Firebase? idk

    this.logger.log(
      `Push notification sent successfully to ${String(userInfo.pushTokens.length)} device(s)`,
    );
  }

  // Utility methods for managing push tokens
  async addPushToken(userId: number, token: string): Promise<void> {
    const userInfo = await this.prisma.notificationUserInfo.findUnique({
      where: { id: userId },
    });

    if (userInfo == null) {
      throw new NotFoundException(`User info not found for user ${String(userId)}`);
    }

    if (!userInfo.pushTokens.includes(token)) {
      await this.prisma.notificationUserInfo.update({
        where: { id: userId },
        data: {
          pushTokens: [...userInfo.pushTokens, token],
        },
      });

      this.logger.log(`Push token added for user ${String(userId)}`);
    }
  }

  async removePushToken(userId: number, token: string): Promise<void> {
    const userInfo = await this.prisma.notificationUserInfo.findUnique({
      where: { id: userId },
    });

    if (userInfo == null) {
      throw new NotFoundException(`User info not found for user ${String(userId)}`);
    }

    await this.prisma.notificationUserInfo.update({
      where: { id: userId },
      data: {
        pushTokens: userInfo.pushTokens.filter((t) => t !== token),
      },
    });

    this.logger.log(`Push token removed for user ${String(userId)}`);
  }

  // Query methods
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getNotificationById(id: number): Promise<Notification | null> {
    return await this.prisma.notification.findUnique({
      where: { id },
    });
  }
}
