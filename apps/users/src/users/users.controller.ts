import {
  CreateUserDto,
  UpdateUserDto,
  UsersMessageTopic,
} from "@app/contracts/users";

import { Controller, ParseIntPipe } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";

import { UsersService } from "./users.service";

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern(UsersMessageTopic.CREATE)
  async create(@Payload() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @MessagePattern(UsersMessageTopic.FIND_ALL)
  async findAll() {
    return await this.usersService.findAll();
  }

  @MessagePattern(UsersMessageTopic.FIND_ONE)
  async findOne(@Payload(ParseIntPipe) id: number) {
    return await this.usersService.findOne(id);
  }

  @MessagePattern(UsersMessageTopic.UPDATE)
  async update(@Payload() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(updateUserDto.id, updateUserDto);
  }

  @MessagePattern(UsersMessageTopic.REMOVE)
  async remove(@Payload(ParseIntPipe) id: number) {
    return await this.usersService.remove(id);
  }
}
