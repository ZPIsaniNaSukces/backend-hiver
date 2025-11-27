import {
  HierarchyScoped,
  HierarchyScopedGuard,
  JwtAuthGuard,
  Roles,
  RolesGuard,
} from "@app/auth";
import { UsersMessageTopic } from "@app/contracts";
import {
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
} from "@app/contracts/leave-requests";
import { UserCreatedEventDto, UserUpdatedEventDto } from "@app/contracts/users";
import { USER_ROLE } from "@prisma/client";

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";

import { LeaveRequestsService } from "./leave-requests.service";

@Controller("leave-requests")
@UseGuards(JwtAuthGuard, RolesGuard, HierarchyScopedGuard)
export class LeaveRequestsController {
  constructor(private readonly leaveRequestsService: LeaveRequestsService) {}

  @Post()
  @HierarchyScoped({ source: "body", propertyPath: "userId" })
  async create(@Body() createLeaveRequestDto: CreateLeaveRequestDto) {
    return await this.leaveRequestsService.create(createLeaveRequestDto);
  }

  @Get()
  @Roles(USER_ROLE.ADMIN, USER_ROLE.MANAGER)
  async findAll() {
    return await this.leaveRequestsService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: number) {
    return await this.leaveRequestsService.findOne(id);
  }

  @Patch(":id")
  @Roles(USER_ROLE.ADMIN, USER_ROLE.MANAGER)
  @HierarchyScoped({
    source: "body",
    propertyPath: "userId",
    allowMissing: true,
  })
  async update(
    @Param("id") id: number,
    @Body() updateLeaveRequestDto: UpdateLeaveRequestDto,
  ) {
    updateLeaveRequestDto.id = id;
    return await this.leaveRequestsService.update(id, updateLeaveRequestDto);
  }

  @Delete(":id")
  @Roles(USER_ROLE.ADMIN, USER_ROLE.MANAGER)
  async remove(@Param("id") id: number) {
    return await this.leaveRequestsService.remove(id);
  }

  @Post(":id/approve")
  @Roles(USER_ROLE.ADMIN, USER_ROLE.MANAGER)
  async approve(@Param("id") id: number) {
    return await this.leaveRequestsService.approve(id);
  }

  @Post(":id/reject")
  @Roles(USER_ROLE.ADMIN, USER_ROLE.MANAGER)
  async reject(@Param("id") id: number) {
    return await this.leaveRequestsService.reject(id);
  }

  // React to user lifecycle events from the Users service
  @MessagePattern(UsersMessageTopic.CREATE)
  async userCreated(@Payload() event: UserCreatedEventDto) {
    return await this.leaveRequestsService.handleUserCreated(event);
  }

  @MessagePattern(UsersMessageTopic.UPDATE)
  async userUpdated(@Payload() event: UserUpdatedEventDto) {
    await this.leaveRequestsService.handleUserUpdated(event);
  }

  @MessagePattern(UsersMessageTopic.REMOVE)
  async userRemoved(@Payload() event: { id: number }) {
    await this.leaveRequestsService.handleUserRemoved(event.id);
  }
}
