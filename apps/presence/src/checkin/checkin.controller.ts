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
  GetMonthlyStatsDto,
} from "@app/contracts/checkin";

import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";

import {
  CheckinService,
  CheckinStatusResponse,
  CheckinStatusWithHistoryResponse,
  HourlyCheckinStat,
  MonthlyStatsResponse,
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

  @Get("stats")
  async getStats(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<HourlyCheckinStat[]> {
    return await this.checkinService.getHourlyStats(user.companyId);
  }

  @Get("monthly-stats")
  @HierarchyScoped({
    source: "query",
    propertyPath: "userId",
    allowMissing: false,
  })
  async getMonthlyStats(
    @Query() query: GetMonthlyStatsDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<MonthlyStatsResponse> {
    const now = new Date();
    const month = query.month ?? now.getMonth() + 1;
    const year = query.year ?? now.getFullYear();

    return await this.checkinService.getMonthlyStats(
      query.userId,
      month,
      year,
      user,
    );
  }
}
