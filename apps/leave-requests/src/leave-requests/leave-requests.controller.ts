import { JwtAuthGuard, Roles, RolesGuard } from "@app/auth";
import {
  CreateLeaveRequestDto,
  UpdateLeaveRequestDto,
} from "@app/contracts/leave-requests";
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

import { LeaveRequestsService } from "./leave-requests.service";

@Controller("leave-requests")
@UseGuards(JwtAuthGuard, RolesGuard)
export class LeaveRequestsController {
  constructor(private readonly leaveRequestsService: LeaveRequestsService) {}

  @Post()
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
}
