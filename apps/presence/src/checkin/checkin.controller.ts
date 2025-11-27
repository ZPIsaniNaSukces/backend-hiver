import {
  CompanyScoped,
  CompanyScopedGuard,
  CurrentUser,
  HierarchyScoped,
  HierarchyScopedGuard,
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
@UseGuards(JwtAuthGuard, RolesGuard, HierarchyScopedGuard)
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Post()
  @CompanyScoped({ source: "body", propertyPath: "companyId" })
  @HierarchyScoped({ source: "body", propertyPath: "userId" })
  @UseGuards(CompanyScopedGuard)
  async checkinCheckout(
    @Body() dto: CheckinCheckoutDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CheckinStatusResponse> {
    return await this.checkinService.checkinCheckout(dto, user);
  }

  @Get()
  @HierarchyScoped({
    source: "query",
    propertyPath: "userId",
    allowMissing: true,
  })
  async getStatus(
    @Query() query: GetCheckinStatusDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CheckinStatusWithHistoryResponse> {
    return await this.checkinService.getLastStatus(query.userId, user);
  }
}
