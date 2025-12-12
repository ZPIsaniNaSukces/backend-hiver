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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { RequestsService } from "./requests.service";

@ApiTags("Requests")
@ApiBearerAuth()
@Controller("requests")
@UseGuards(JwtAuthGuard, RolesGuard, HierarchyScopedGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post("availability")
  @HierarchyScoped({ source: "body", propertyPath: "userId" })
  @ApiOperation({
    summary: "Create an availability request (vacation, online/offline work)",
  })
  @ApiResponse({ status: 201, description: "Availability request created" })
  async createAvailabilityRequest(@Body() dto: CreateAvailabilityRequestDto) {
    return await this.requestsService.createAvailabilityRequest(dto);
  }

  @Post("general")
  @HierarchyScoped({ source: "body", propertyPath: "userId" })
  @ApiOperation({ summary: "Create a general request" })
  @ApiResponse({ status: 201, description: "General request created" })
  async createGeneralRequest(@Body() dto: CreateGeneralRequestDto) {
    return await this.requestsService.createGeneralRequest(dto);
  }

  @Get("availability")
  @ApiOperation({ summary: "Get all availability requests" })
  @ApiResponse({
    status: 200,
    description: "Returns list of availability requests",
  })
  async findAllAvailability(
    @CurrentUser() user: { id: number; role: USER_ROLE | null },
  ) {
    return await this.requestsService.findAllAvailabilityRequests(user);
  }

  @Get("general")
  @ApiOperation({ summary: "Get all general requests" })
  @ApiResponse({ status: 200, description: "Returns list of general requests" })
  async findAllGeneral(
    @CurrentUser() user: { id: number; role: USER_ROLE | null },
  ) {
    return await this.requestsService.findAllGeneralRequests(user);
  }

  @Post("availability/:id/approve")
  @Roles(USER_ROLE.ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({
    summary: "Approve an availability request (Admin/Manager only)",
  })
  @ApiParam({ name: "id", description: "Request ID" })
  @ApiResponse({ status: 200, description: "Request approved" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Request not found" })
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
  @ApiOperation({
    summary: "Reject an availability request (Admin/Manager only)",
  })
  @ApiParam({ name: "id", description: "Request ID" })
  @ApiResponse({ status: 200, description: "Request rejected" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Request not found" })
  async rejectAvailability(
    @Param("id") id: number,
    @CurrentUser("id") rejectorId: number,
  ) {
    return await this.requestsService.rejectAvailabilityRequest(id, rejectorId);
  }

  @Post("general/:id/approve")
  @Roles(USER_ROLE.ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({ summary: "Approve a general request (Admin/Manager only)" })
  @ApiParam({ name: "id", description: "Request ID" })
  @ApiResponse({ status: 200, description: "Request approved" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Request not found" })
  async approveGeneral(
    @Param("id") id: number,
    @CurrentUser("id") approverId: number,
  ) {
    return await this.requestsService.approveGeneralRequest(id, approverId);
  }

  @Post("general/:id/reject")
  @Roles(USER_ROLE.ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({ summary: "Reject a general request (Admin/Manager only)" })
  @ApiParam({ name: "id", description: "Request ID" })
  @ApiResponse({ status: 200, description: "Request rejected" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Request not found" })
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
