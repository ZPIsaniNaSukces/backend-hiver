import {
  CurrentUser,
  HierarchyScoped,
  HierarchyScopedGuard,
  JwtAuthGuard,
  Roles,
  RolesGuard,
} from "@app/auth";
import type { AuthenticatedUser } from "@app/auth";
import { CreateTaskDto, UpdateTaskDto } from "@app/contracts/tasks";
import { TASK_STATUS } from "@generated/tasks";
import { USER_ROLE } from "@prisma/client";

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";

import { TasksService } from "./tasks.service";

@Controller("tasks")
@UseGuards(JwtAuthGuard, RolesGuard, HierarchyScopedGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles(USER_ROLE.ADMIN, USER_ROLE.MANAGER)
  @HierarchyScoped({
    source: "body",
    propertyPath: "assigneeId",
    allowMissing: true,
  })
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.tasksService.create(createTaskDto, user);
  }

  @Get()
  async findAll() {
    return await this.tasksService.findAll();
  }

  @Get("status/:status")
  async findByStatus(
    @Param("status") status: TASK_STATUS,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.tasksService.findByStatus(status, user);
  }

  @Get("user/:userId")
  async findForUser(
    @Param("userId", ParseIntPipe) userId: number,
    @Query("type") type: "assigned" | "reported" = "assigned",
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (type === "reported") {
      return await this.tasksService.findReportedByUser(userId, user);
    }
    return await this.tasksService.findAssignedToUser(userId, user);
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return await this.tasksService.findOne(id);
  }

  @Patch(":id")
  @Roles(USER_ROLE.ADMIN, USER_ROLE.MANAGER)
  @HierarchyScoped({
    source: "body",
    propertyPath: "assigneeId",
    allowMissing: true,
  })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.tasksService.update(id, updateTaskDto, user);
  }

  @Delete(":id")
  @Roles(USER_ROLE.ADMIN, USER_ROLE.MANAGER)
  async remove(@Param("id", ParseIntPipe) id: number) {
    return await this.tasksService.remove(id);
  }
}
