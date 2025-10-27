import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from "@app/auth";
import type { RegistrationResult } from "@app/contracts/users";
import {
  CreateUserDto,
  RegisterUserDto,
  UpdateUserDto,
} from "@app/contracts/users";
import { USER_ROLE } from "@prisma/client";

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";

import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(USER_ROLE.ADMIN)
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Post("register")
  @Roles(USER_ROLE.ADMIN)
  async register(
    @Body() registerUserDto: RegisterUserDto,
    @CurrentUser("id") authUserId: number,
  ): Promise<RegistrationResult> {
    return await this.usersService.register(
      registerUserDto.email,
      registerUserDto.companyId,
      registerUserDto.bossId ?? authUserId,
    );
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
    return await this.usersService.update(id, updateUserDto);
  }

  @Delete(":id")
  @Roles(USER_ROLE.ADMIN)
  async remove(@Param("id") id: number) {
    return await this.usersService.remove(id);
  }
}
