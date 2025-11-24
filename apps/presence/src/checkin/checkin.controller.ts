import {
  CompanyScoped,
  CompanyScopedGuard,
  CurrentUser,
  JwtAuthGuard,
  RolesGuard,
} from "@app/auth";
import type { AuthenticatedUser } from "@app/auth";
import {
  CheckinCheckoutDto,
  GetCheckinStatusDto,
} from "@app/contracts/checkin";

import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";

import {
  CheckinService,
  CheckinStatusResponse,
  CheckinStatusWithHistoryResponse,
} from "./checkin.service";

@Controller("checkincheckout")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Post()
  @CompanyScoped({ source: "body", propertyPath: "companyId" })
  @UseGuards(CompanyScopedGuard)
  async checkinCheckout(
    @Body() dto: CheckinCheckoutDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CheckinStatusResponse> {
    return await this.checkinService.checkinCheckout(dto, user);
  }

  @Get()
  async getStatus(
    @Query() query: GetCheckinStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CheckinStatusWithHistoryResponse> {
    return await this.checkinService.getLastStatus(query.userId, user);
  }
}
