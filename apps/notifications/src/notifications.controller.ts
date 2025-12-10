import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from "@nestjs/common";

import { NotificationsService } from "./notifications.service";

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  getHealth(): string {
    return "Notifications service is running";
  }

  /**
   * Add a push notification token for a user
   * POST /push-token/:userId
   * Body: { token: string }
   */
  @Post("push-token/:userId")
  async addPushToken(
    @Param("userId", ParseIntPipe) userId: number,
    @Body() body: { token: string },
  ): Promise<{ message: string }> {
    await this.notificationsService.addPushToken(userId, body.token);
    return { message: "Push token added successfully" };
  }

  /**
   * Remove a push notification token for a user
   * DELETE /push-token/:userId
   * Body: { token: string }
   */
  @Delete("push-token/:userId")
  async removePushToken(
    @Param("userId", ParseIntPipe) userId: number,
    @Body() body: { token: string },
  ): Promise<{ message: string }> {
    await this.notificationsService.removePushToken(userId, body.token);
    return { message: "Push token removed successfully" };
  }
}
