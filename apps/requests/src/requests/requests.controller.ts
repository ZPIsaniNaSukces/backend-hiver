import {
  CurrentUser,
  HierarchyScoped,
  HierarchyScopedGuard,
  JwtAuthGuard,
  Roles,
  RolesGuard,
} from "@app/auth";
import { UsersMessageTopic } from "@app/contracts";
import {
  CreateAvailabilityRequestDto,
  CreateGeneralRequestDto,
} from "@app/contracts/requests";
import { UserCreatedEventDto, UserUpdatedEventDto } from "@app/contracts/users";
import { USER_ROLE } from "@prisma/client";

import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";

import { RequestsService } from "./requests.service";

@Controller("requests")
@UseGuards(JwtAuthGuard, RolesGuard, HierarchyScopedGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post("availability")
  @HierarchyScoped({ source: "body", propertyPath: "userId" })
  async createAvailabilityRequest(@Body() dto: CreateAvailabilityRequestDto) {
    return await this.requestsService.createAvailabilityRequest(dto);
  }

  @Post("general")
  @HierarchyScoped({ source: "body", propertyPath: "userId" })
  async createGeneralRequest(@Body() dto: CreateGeneralRequestDto) {
    return await this.requestsService.createGeneralRequest(dto);
  }

  @Get("availability")
  async findAllAvailability(
    @CurrentUser() user: { id: number; role: USER_ROLE | null },
  ) {
    return await this.requestsService.findAllAvailabilityRequests(user);
  }

  @Get("general")
  async findAllGeneral(
    @CurrentUser() user: { id: number; role: USER_ROLE | null },
  ) {
    return await this.requestsService.findAllGeneralRequests(user);
  }

  @Post("availability/:id/approve")
  @Roles(USER_ROLE.ADMIN, USER_ROLE.MANAGER)
  async approveAvailability(
    @Param("id") id: number,
    @CurrentUser("id") approverId: number,
  ) {
    return await this.requestsService.approveAvailabilityRequest(
      id,
      approverId,
    );
  }

  @Post("availability/:id/reject")
  @Roles(USER_ROLE.ADMIN, USER_ROLE.MANAGER)
  async rejectAvailability(
    @Param("id") id: number,
    @CurrentUser("id") rejectorId: number,
  ) {
    return await this.requestsService.rejectAvailabilityRequest(id, rejectorId);
  }

  @Post("general/:id/approve")
  @Roles(USER_ROLE.ADMIN, USER_ROLE.MANAGER)
  async approveGeneral(
    @Param("id") id: number,
    @CurrentUser("id") approverId: number,
  ) {
    return await this.requestsService.approveGeneralRequest(id, approverId);
  }

  @Post("general/:id/reject")
  @Roles(USER_ROLE.ADMIN, USER_ROLE.MANAGER)
  async rejectGeneral(
    @Param("id") id: number,
    @CurrentUser("id") rejectorId: number,
  ) {
    return await this.requestsService.rejectGeneralRequest(id, rejectorId);
  }

  // Event handlers
  @MessagePattern(UsersMessageTopic.CREATE)
  async userCreated(@Payload() event: UserCreatedEventDto) {
    return await this.requestsService.handleUserCreated(event);
  }

  @MessagePattern(UsersMessageTopic.UPDATE)
  async userUpdated(@Payload() event: UserUpdatedEventDto) {
    await this.requestsService.handleUserUpdated(event);
  }

  @MessagePattern(UsersMessageTopic.REMOVE)
  async userRemoved(@Payload() event: { id: number }) {
    await this.requestsService.handleUserRemoved(event.id);
  }
}
