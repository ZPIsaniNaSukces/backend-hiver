import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  OnModuleDestroy,
  OnModuleInit,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";

import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Controller("users")
export class UsersController implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject("USERS_SERVICE") private readonly usersClient: ClientKafka,
  ) {}

  async onModuleInit() {
    const patterns = [
      "createUser",
      "findAllUsers",
      "findOneUser",
      "updateUser",
      "removeUser",
    ];
    for (const pattern of patterns) {
      this.usersClient.subscribeToResponseOf(pattern);
    }
    await this.usersClient.connect();
  }

  async onModuleDestroy() {
    await this.usersClient.close();
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersClient.send("createUser", createUserDto);
  }

  @Get()
  findAll() {
    return this.usersClient.send("findAllUsers", {});
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.usersClient.send("findOneUser", id);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    updateUserDto.id = id;
    return this.usersClient.send("updateUser", updateUserDto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.usersClient.send("removeUser", id);
  }
}
