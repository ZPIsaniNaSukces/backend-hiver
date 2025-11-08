import { CurrentUser, JwtAuthGuard, RolesGuard } from "@app/auth";
import type { AuthenticatedUser } from "@app/auth";

import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";

import { CheckinUserInfoService } from "./checkin-user-info.service";

@Controller("checkin-user-info")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CheckinUserInfoController {
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
}
