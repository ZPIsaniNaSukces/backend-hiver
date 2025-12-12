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
import { PaginationQueryDto } from "@app/pagination";
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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { TasksService } from "./tasks.service";

@ApiTags("Tasks")
@ApiBearerAuth()
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
  @ApiOperation({ summary: "Create a new task (Admin/Manager only)" })
  @ApiResponse({ status: 201, description: "Task created successfully" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async create(
    @Body() createTaskDto: CreateTaskDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.tasksService.create(createTaskDto, user);
  }

  @Get()
  @ApiOperation({ summary: "Get all tasks with pagination" })
  @ApiResponse({ status: 200, description: "Returns paginated list of tasks" })
  async findAll(@Query() query: PaginationQueryDto) {
    return await this.tasksService.findAll(query);
  }

  @Get("status/:status")
  @ApiOperation({ summary: "Get tasks by status" })
  @ApiParam({ name: "status", enum: TASK_STATUS, description: "Task status" })
  @ApiResponse({
    status: 200,
    description: "Returns tasks with specified status",
  })
  async findByStatus(
    @Param("status") status: TASK_STATUS,
    @Query() query: PaginationQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.tasksService.findByStatus(status, query, user);
  }

  @Get("summary")
  @ApiOperation({ summary: "Get tasks summary statistics" })
  @ApiQuery({
    name: "days",
    type: Number,
    description: "Number of days for summary",
    required: false,
  })
  @ApiResponse({ status: 200, description: "Returns tasks summary" })
  async getSummary(
    @Query("days", ParseIntPipe) days = 30,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.tasksService.getTasksSummary(days, user);
  }

  @Get("chart")
  @ApiOperation({ summary: "Get tasks chart data" })
  @ApiQuery({
    name: "days",
    type: Number,
    description: "Number of days for chart",
    required: false,
  })
  @ApiResponse({ status: 200, description: "Returns tasks chart data" })
  async getChart(
    @Query("days", ParseIntPipe) days = 7,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.tasksService.getTasksChart(days, user);
  }

  @Get("user/:userId")
  @ApiOperation({ summary: "Get tasks for a specific user" })
  @ApiParam({ name: "userId", description: "User ID" })
  @ApiQuery({
    name: "type",
    enum: ["assigned", "reported"],
    description: "Task type filter",
    required: false,
  })
  @ApiResponse({ status: 200, description: "Returns user tasks" })
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
  @ApiOperation({ summary: "Get a task by ID" })
  @ApiParam({ name: "id", description: "Task ID" })
  @ApiResponse({ status: 200, description: "Returns the task" })
  @ApiResponse({ status: 404, description: "Task not found" })
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return await this.tasksService.findOne(id);
  }

  @Patch(":id/done")
  @ApiOperation({ summary: "Mark a task as done" })
  @ApiParam({ name: "id", description: "Task ID" })
  @ApiResponse({ status: 200, description: "Task marked as done" })
  @ApiResponse({ status: 404, description: "Task not found" })
  async markAsDone(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.tasksService.markAsDone(id, user);
  }

  @Patch(":id")
  @Roles(USER_ROLE.ADMIN, USER_ROLE.MANAGER)
  @HierarchyScoped({
    source: "body",
    propertyPath: "assigneeId",
    allowMissing: true,
  })
  @ApiOperation({ summary: "Update a task (Admin/Manager only)" })
  @ApiParam({ name: "id", description: "Task ID" })
  @ApiResponse({ status: 200, description: "Task updated successfully" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Task not found" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.tasksService.update(id, updateTaskDto, user);
  }

  @Delete(":id")
  @Roles(USER_ROLE.ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({ summary: "Delete a task (Admin/Manager only)" })
  @ApiParam({ name: "id", description: "Task ID" })
  @ApiResponse({ status: 200, description: "Task deleted successfully" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Task not found" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return await this.tasksService.remove(id);
  }
}
