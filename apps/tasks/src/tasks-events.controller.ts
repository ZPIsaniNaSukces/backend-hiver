import {
  UserCreatedEventDto,
  UserRemovedEventDto,
  UserUpdatedEventDto,
  UsersMessageTopic,
} from "@app/contracts/users";

import { Controller } from "@nestjs/common";
import { EventPattern, Payload } from "@nestjs/microservices";

import { TasksService } from "./tasks.service";

@Controller()
export class TasksEventsController {
  constructor(private readonly tasksService: TasksService) {}

  @EventPattern(UsersMessageTopic.CREATE)
  async handleUserCreated(@Payload() event: UserCreatedEventDto) {
    await this.tasksService.handleUserCreated(event);
  }

  @EventPattern(UsersMessageTopic.UPDATE)
  async handleUserUpdated(@Payload() event: UserUpdatedEventDto) {
    await this.tasksService.handleUserUpdated(event);
  }

  @EventPattern(UsersMessageTopic.REMOVE)
  async handleUserRemoved(@Payload() event: UserRemovedEventDto) {
    await this.tasksService.handleUserRemoved(event);
  }
}
