import { JwtAuthGuard, Roles, RolesGuard } from "@app/auth";
import { CreateTaskDto, UpdateTaskDto } from "@app/contracts/tasks";
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

// We need
// crud
// tasks for specific user

@Controller("tasks")
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @Roles(USER_ROLE.ADMIN)
  async create(@Body() createTaskDto: CreateTaskDto) {
    return await this.tasksService.create(createTaskDto);
  }

  @Get()
  async findAll() {
    return await this.tasksService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return await this.tasksService.findOne(id);
  }

  @Patch(":id")
  @Roles(USER_ROLE.ADMIN)
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return await this.tasksService.update(id, updateTaskDto);
  }

  @Delete(":id")
  @Roles(USER_ROLE.ADMIN)
  async remove(@Param("id", ParseIntPipe) id: number) {
    return await this.tasksService.remove(id);
  }

  // type=reported || assigned
  // should we make two separate endpoints?
  // should me make it an enum?
  @Get("user/:userId")
  async findForUser(
    @Param("userId", ParseIntPipe) userId: number,
    @Query("type") type: "assigned" | "reported" = "assigned",
  ) {
    if (type === "reported") {
      return await this.tasksService.findReportedByUser(userId);
    }
    return await this.tasksService.findAssignedToUser(userId);
  }
}
