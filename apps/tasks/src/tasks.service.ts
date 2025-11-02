import { CreateTaskDto, UpdateTaskDto } from "@app/contracts/tasks";
import { PrismaService } from "@app/prisma/prisma.service";

import { Injectable } from "@nestjs/common";

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto) {
    return this.prisma.task.create({ data: createTaskDto });
  }

  async findAll() {
    return this.prisma.task.findMany();
  }

  async findOne(id: number) {
    return this.prisma.task.findUnique({ where: { id } });
  }

  async update(id: number, updateTaskDto: UpdateTaskDto) {
    return this.prisma.task.update({
      where: { id },
      data: updateTaskDto,
    });
  }

  async remove(id: number) {
    return this.prisma.task.delete({ where: { id } });
  }

  async findAssignedToUser(userId: number) {
    return this.prisma.task.findMany({ where: { assigneeId: userId } });
  }

  async findReportedByUser(userId: number) {
    return this.prisma.task.findMany({ where: { reporterId: userId } });
  }
}
