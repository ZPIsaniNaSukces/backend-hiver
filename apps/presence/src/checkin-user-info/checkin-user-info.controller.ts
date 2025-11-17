import { CurrentUser, JwtAuthGuard, RolesGuard } from "@app/auth";
import type { AuthenticatedUser } from "@app/auth";
import {
  UserCreatedEventDto,
  UserRemovedEventDto,
  UserUpdatedEventDto,
  UsersMessageTopic,
} from "@app/contracts/users";

import {
  Controller,
  Get,
  Logger,
  Param,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";

import { CheckinUserInfoService } from "./checkin-user-info.service";

@Controller("checkin-user-info")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CheckinUserInfoController {
  private readonly logger = new Logger(CheckinUserInfoController.name);

  constructor(
    private readonly checkinUserInfoService: CheckinUserInfoService,
  ) {}

  @Get(":userId")
  async findOne(
    @Param("userId", ParseIntPipe) userId: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.checkinUserInfoService.findOne(userId, user);
  }

  @EventPattern(UsersMessageTopic.CREATE)
  async handleUserCreated(@Payload() data: UserCreatedEventDto) {
    this.logger.log(
      `Received user created event for user ID: ${String(data.id)}`,
    );
    await this.checkinUserInfoService.upsert(
      data.id,
      data.bossId ?? null,
      data.companyId,
    );
  }

  @EventPattern(UsersMessageTopic.UPDATE)
  async handleUserUpdated(@Payload() data: UserUpdatedEventDto) {
    this.logger.log(
      `Received user updated event for user ID: ${String(data.id)}`,
    );
    if (data.companyId !== undefined) {
      await this.checkinUserInfoService.upsert(
        data.id,
        data.bossId ?? null,
        data.companyId,
      );
    }
  }

  @EventPattern(UsersMessageTopic.REMOVE)
  async handleUserRemoved(@Payload() data: UserRemovedEventDto) {
    this.logger.log(
      `Received user removed event for user ID: ${String(data.id)}`,
    );
    await this.checkinUserInfoService.remove(data.id);
  }
}
