import type { AuthenticatedUser } from "@app/auth";
import { CreateTaskDto, UpdateTaskDto } from "@app/contracts/tasks";
import {
  UserCreatedEventDto,
  UserRemovedEventDto,
  UserUpdatedEventDto,
} from "@app/contracts/users";
import {
  PaginationQueryDto,
  createPaginatedResponse,
  getPaginationParameters,
} from "@app/pagination";
import type { Prisma, Task } from "@generated/tasks";
import { TASK_STATUS } from "@generated/tasks";
import { USER_ROLE } from "@prisma/client";

import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { TASKS_PRISMA, TasksPrismaClient } from "./prisma/prisma.constants";
import { TasksHierarchyService } from "./tasks-hierarchy.service";

@Injectable()
export class TasksService {
  constructor(
    @Inject(TASKS_PRISMA)
    private readonly prisma: TasksPrismaClient,
    private readonly hierarchyService: TasksHierarchyService,
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

  async findAll(query: PaginationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const { skip, take } = getPaginationParameters(page, limit);

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          assignee: true,
          reporter: true,
        },
      }),
      this.prisma.task.count(),
    ]);

    return createPaginatedResponse(tasks, total, page, limit);
  }

  async findOne(id: number) {
    return await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: true,
        reporter: true,
      },
    });
  }

  async update(
    id: number,
    updateTaskDto: UpdateTaskDto,
    user: AuthenticatedUser,
  ): Promise<Task> {
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (task == null) {
      throw new NotFoundException(`Task with ID ${String(id)} not found`);
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
      throw new NotFoundException(`Task with ID ${String(id)} not found`);
    }

    return await this.prisma.task.delete({ where: { id } });
  }

  async findAssignedToUser(userId: number, user: AuthenticatedUser) {
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
      include: {
        assignee: true,
        reporter: true,
      },
    });
  }

  async findReportedByUser(userId: number, user: AuthenticatedUser) {
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
      include: {
        assignee: true,
        reporter: true,
      },
    });
  }

  async findByStatus(
    status: TASK_STATUS,
    query: PaginationQueryDto,
    _user: AuthenticatedUser,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const { skip, take } = getPaginationParameters(page, limit);

    const where = { status };

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          assignee: true,
          reporter: true,
        },
      }),
      this.prisma.task.count({ where }),
    ]);

    return createPaginatedResponse(tasks, total, page, limit);
  }

  async markAsDone(id: number, user: AuthenticatedUser): Promise<Task> {
    const task = await this.prisma.task.findUnique({ where: { id } });

    if (task == null) {
      throw new NotFoundException(`Task with ID ${String(id)} not found`);
    }

    // ADMINs can always mark tasks as done
    if (user.role === USER_ROLE.ADMIN) {
      return await this.prisma.task.update({
        where: { id },
        data: { status: TASK_STATUS.DONE },
      });
    }

    // Users can mark their own tasks (where they are the assignee) as done
    if (task.assigneeId === user.id) {
      return await this.prisma.task.update({
        where: { id },
        data: { status: TASK_STATUS.DONE },
      });
    }

    // MANAGERs can mark tasks as done for users below them in hierarchy
    if (user.role === USER_ROLE.MANAGER && task.assigneeId != null) {
      const isAbove = await this.hierarchyService.isAboveInHierarchy(
        user.id,
        task.assigneeId,
      );

      if (isAbove) {
        return await this.prisma.task.update({
          where: { id },
          data: { status: TASK_STATUS.DONE },
        });
      }
    }

    throw new ForbiddenException(
      "You can only mark your own tasks as done, or tasks of users below you in the hierarchy",
    );
  }

  async getTasksSummary(days: number, user: AuthenticatedUser) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const tasks = await this.prisma.task.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
        assignee: {
          companyId: user.companyId,
        },
      },
      select: {
        status: true,
      },
    });

    const completed = tasks.filter((t) => t.status === TASK_STATUS.DONE).length;
    const pending = tasks.filter((t) => t.status === TASK_STATUS.TODO).length;

    return { completed, pending };
  }

  async getTasksChart(days: number, user: AuthenticatedUser) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const tasks = await this.prisma.task.findMany({
      where: {
        createdAt: {
          gte: startDate,
        },
        assignee: {
          companyId: user.companyId,
        },
      },
      select: {
        status: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    // Create a map to aggregate tasks by date
    const tasksByDate = new Map<
      string,
      { completed: number; pending: number }
    >();

    // Initialize all dates in range
    let currentDateIterator = new Date(startDate);
    const todayEnd = new Date();
    todayEnd.setHours(0, 0, 0, 0);

    while (currentDateIterator <= todayEnd) {
      const dateString = currentDateIterator.toISOString().split("T")[0];
      tasksByDate.set(dateString, { completed: 0, pending: 0 });
      currentDateIterator = new Date(currentDateIterator);
      currentDateIterator.setDate(currentDateIterator.getDate() + 1);
    }

    // Aggregate tasks by date
    for (const task of tasks) {
      const dateString = task.createdAt.toISOString().split("T")[0];
      const entry = tasksByDate.get(dateString);
      if (entry != null) {
        if (task.status === TASK_STATUS.DONE) {
          entry.completed++;
        } else {
          entry.pending++;
        }
      }
    }

    // Convert to array format
    return [...tasksByDate.entries()]
      .map(([date, counts]) => ({
        date,
        ...counts,
      }))
      .toSorted((a, b) => a.date.localeCompare(b.date));
  }

  // Kafka event handlers
  async handleUserCreated(event: UserCreatedEventDto): Promise<void> {
    await this.prisma.taskUserInfo.create({
      data: {
        id: event.id,
        bossId: event.bossId ?? null,
        companyId: event.companyId,
        name: event.name ?? null,
        lastName: event.lastName ?? null,
        title: event.title ?? null,
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
    if (event.name !== undefined) {
      data.name = event.name;
    }
    if (event.lastName !== undefined) {
      data.lastName = event.lastName;
    }
    if (event.title !== undefined) {
      data.title = event.title;
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
