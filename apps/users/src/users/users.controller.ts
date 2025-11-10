import { JwtAuthGuard, Roles, RolesGuard } from "@app/auth";
import {
  CreateUserDto,
  UpdateUserDto,
  UserCreatedEventDto,
  UserRemovedEventDto,
  UserUpdatedEventDto,
  UsersMessageTopic,
} from "@app/contracts/users";
import { USER_ROLE } from "@prisma/client";

import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";

import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject("USERS_SERVICE") private readonly client: ClientKafka,
  ) {}

  @Post()
  @Roles(USER_ROLE.ADMIN)
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    const event: UserCreatedEventDto = {
      id: user.id,
      bossId: user.bossId,
      companyId: user.companyId,
    };
    this.client.emit(UsersMessageTopic.CREATE, event);
    return user;
  }

  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: number) {
    return await this.usersService.findOne(id);
  }

  @Patch(":id")
  @Roles(USER_ROLE.ADMIN, USER_ROLE.MANAGER)
  async update(@Param("id") id: number, @Body() updateUserDto: UpdateUserDto) {
    updateUserDto.id = id;
    const user = await this.usersService.update(id, updateUserDto);
    const event: UserUpdatedEventDto = {
      id: user.id,
      bossId: user.bossId,
      companyId: user.companyId,
    };
    this.client.emit(UsersMessageTopic.UPDATE, event);
    return user;
  }

  @Delete(":id")
  @Roles(USER_ROLE.ADMIN)
  async remove(@Param("id") id: number) {
    const user = await this.usersService.remove(id);
    const event: UserRemovedEventDto = { id };
    this.client.emit(UsersMessageTopic.REMOVE, event);
    return user;
  }
}
