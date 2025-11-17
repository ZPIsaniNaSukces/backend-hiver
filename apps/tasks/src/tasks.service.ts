import type { AuthenticatedUser } from "@app/auth";
import { CreateTaskDto, UpdateTaskDto } from "@app/contracts/tasks";
import {
  UserCreatedEventDto,
  UserRemovedEventDto,
  UserUpdatedEventDto,
} from "@app/contracts/users";
import type { Prisma, Task } from "@generated/tasks";
import { TASK_STATUS } from "@generated/tasks";

import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { TASKS_PRISMA, TasksPrismaClient } from "./prisma/prisma.constants";

@Injectable()
export class TasksService {
  constructor(
    @Inject(TASKS_PRISMA)
    private readonly prisma: TasksPrismaClient,
  ) {}

  async create(
    createTaskDto: CreateTaskDto,
    user: AuthenticatedUser,
  ): Promise<Task> {
    // Verify assignee exists if provided
    if (createTaskDto.assigneeId != null) {
      const assignee = await this.prisma.taskUserInfo.findUnique({
        where: { id: createTaskDto.assigneeId },
      });

      if (assignee == null) {
        throw new NotFoundException("Assignee not found");
      }

      if (assignee.companyId !== user.companyId) {
        throw new ForbiddenException(
          "Cannot assign tasks to users from another company",
        );
      }
    }

    const data: Prisma.TaskUncheckedCreateInput = {
      title: createTaskDto.title,
      description: createTaskDto.description,
      status: createTaskDto.status ?? TASK_STATUS.TODO,
      type: createTaskDto.type,
      dueDate: createTaskDto.dueDate,
      reporterId: createTaskDto.reporterId ?? user.id,
      assigneeId: createTaskDto.assigneeId,
    };

    return await this.prisma.task.create({ data });
  }

  async findAll(): Promise<Task[]> {
    return await this.prisma.task.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: number): Promise<Task | null> {
    return await this.prisma.task.findUnique({ where: { id } });
  }

  async update(
    id: number,
    updateTaskDto: UpdateTaskDto,
    user: AuthenticatedUser,
  ): Promise<Task> {
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (task == null) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    // Verify assignee exists if provided
    if (updateTaskDto.assigneeId != null) {
      const assignee = await this.prisma.taskUserInfo.findUnique({
        where: { id: updateTaskDto.assigneeId },
      });

      if (assignee == null) {
        throw new NotFoundException("Assignee not found");
      }

      if (assignee.companyId !== user.companyId) {
        throw new ForbiddenException(
          "Cannot assign tasks to users from another company",
        );
      }
    }

    const data: Prisma.TaskUncheckedUpdateInput = {
      title: updateTaskDto.title,
      description: updateTaskDto.description,
      status: updateTaskDto.status,
      type: updateTaskDto.type,
      dueDate: updateTaskDto.dueDate,
      reporterId: updateTaskDto.reporterId,
      assigneeId: updateTaskDto.assigneeId,
    };

    return await this.prisma.task.update({
      where: { id },
      data,
    });
  }

  async remove(id: number): Promise<Task> {
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (task == null) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return await this.prisma.task.delete({ where: { id } });
  }

  async findAssignedToUser(
    userId: number,
    user: AuthenticatedUser,
  ): Promise<Task[]> {
    const userInfo = await this.prisma.taskUserInfo.findUnique({
      where: { id: userId },
    });

    if (userInfo == null) {
      throw new NotFoundException("User not found");
    }

    if (userInfo.companyId !== user.companyId) {
      throw new ForbiddenException("Cannot access tasks from another company");
    }

    return await this.prisma.task.findMany({
      where: { assigneeId: userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findReportedByUser(
    userId: number,
    user: AuthenticatedUser,
  ): Promise<Task[]> {
    const userInfo = await this.prisma.taskUserInfo.findUnique({
      where: { id: userId },
    });

    if (userInfo == null) {
      throw new NotFoundException("User not found");
    }

    if (userInfo.companyId !== user.companyId) {
      throw new ForbiddenException("Cannot access tasks from another company");
    }

    return await this.prisma.task.findMany({
      where: { reporterId: userId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findByStatus(
    status: TASK_STATUS,
    user: AuthenticatedUser,
  ): Promise<Task[]> {
    return await this.prisma.task.findMany({
      where: { status },
      orderBy: { createdAt: "desc" },
    });
  }

  // Kafka event handlers
  async handleUserCreated(event: UserCreatedEventDto): Promise<void> {
    await this.prisma.taskUserInfo.create({
      data: {
        id: event.id,
        bossId: event.bossId ?? null,
        companyId: event.companyId,
      },
    });
  }

  async handleUserUpdated(event: UserUpdatedEventDto): Promise<void> {
    const data: Prisma.TaskUserInfoUpdateInput = {};

    if (event.bossId !== undefined) {
      data.bossId = event.bossId;
    }
    if (event.companyId !== undefined) {
      data.companyId = event.companyId;
    }

    await this.prisma.taskUserInfo.update({
      where: { id: event.id },
      data,
    });
  }

  async handleUserRemoved(event: UserRemovedEventDto): Promise<void> {
    await this.prisma.taskUserInfo.delete({
      where: { id: event.id },
    });
  }
}
