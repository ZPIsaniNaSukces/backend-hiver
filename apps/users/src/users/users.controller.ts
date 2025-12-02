import type { AuthenticatedUser } from "@app/auth";
import {
  CurrentUser,
  HierarchyScoped,
  HierarchyScopedGuard,
  JwtAuthGuard,
  Roles,
  RolesGuard,
} from "@app/auth";
import type { RegistrationResult } from "@app/contracts/users";
import {
  CompleteRegistrationDto,
  CreateUserDto,
  RegisterUserDto,
  UpdateUserDto,
} from "@app/contracts/users";
import { PaginatedSearchQueryDto } from "@app/pagination";
import { USER_ROLE } from "@prisma/client";

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";

import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard, HierarchyScopedGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(USER_ROLE.ADMIN)
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return await this.usersService.create(createUserDto, admin.companyId);
  }

  @Post("register")
  @Roles(USER_ROLE.ADMIN)
  async register(
    @Body() registerUserDto: RegisterUserDto,
    @CurrentUser() admin: AuthenticatedUser,
  ): Promise<RegistrationResult> {
    return await this.usersService.register(
      registerUserDto.email,
      admin.companyId,
      registerUserDto.bossId ?? admin.id,
      registerUserDto.title,
      registerUserDto.name,
      registerUserDto.surname,
    );
  }

  @Get()
  async findAll(@Query() query: PaginatedSearchQueryDto) {
    return await this.usersService.findAll(query);
  }

  @Get(":id")
  async findOne(@Param("id") id: number) {
    return await this.usersService.findOne(id);
  }

  @Patch(":id")
  @Roles(USER_ROLE.ADMIN, USER_ROLE.MANAGER)
  @HierarchyScoped({ source: "params", propertyPath: "id" })
  async update(@Param("id") id: number, @Body() updateUserDto: UpdateUserDto) {
    updateUserDto.id = id;
    return await this.usersService.update(id, updateUserDto);
  }

  @Patch(":id/complete-registration")
  @HierarchyScoped({ source: "params", propertyPath: "id", allowSelf: true })
  async completeRegistration(
    @Param("id") id: number,
    @Body() completeRegistrationDto: CompleteRegistrationDto,
    @CurrentUser("id") authUserId: number,
  ) {
    if (id !== authUserId) {
      throw new Error("You can only complete your own registration");
    }
    return await this.usersService.completeRegistration(
      id,
      completeRegistrationDto,
    );
  }

  @Delete(":id")
  @Roles(USER_ROLE.ADMIN)
  @HierarchyScoped({ source: "params", propertyPath: "id" })
  async remove(@Param("id") id: number) {
    return await this.usersService.remove(id);
  }
}
