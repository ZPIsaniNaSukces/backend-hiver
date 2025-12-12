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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { UsersService } from "./users.service";

@ApiTags("Users")
@ApiBearerAuth()
@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard, HierarchyScopedGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles(USER_ROLE.ADMIN)
  @ApiOperation({ summary: "Create a new user (Admin only)" })
  @ApiResponse({ status: 201, description: "User created successfully" })
  @ApiResponse({ status: 403, description: "Forbidden - Admin role required" })
  async create(
    @Body() createUserDto: CreateUserDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return await this.usersService.create(createUserDto, admin.companyId);
  }

  @Post("register")
  @Roles(USER_ROLE.ADMIN)
  @ApiOperation({ summary: "Register a new user (Admin only)" })
  @ApiResponse({ status: 201, description: "User registered successfully" })
  @ApiResponse({ status: 403, description: "Forbidden - Admin role required" })
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
  @ApiOperation({ summary: "Get all users with pagination and search" })
  @ApiResponse({ status: 200, description: "Returns paginated list of users" })
  async findAll(@Query() query: PaginatedSearchQueryDto) {
    return await this.usersService.findAll(query);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a user by ID" })
  @ApiParam({ name: "id", description: "User ID" })
  @ApiResponse({ status: 200, description: "Returns the user" })
  @ApiResponse({ status: 404, description: "User not found" })
  async findOne(@Param("id") id: number) {
    return await this.usersService.findOne(id);
  }

  @Patch(":id")
  @Roles(USER_ROLE.ADMIN, USER_ROLE.MANAGER)
  @HierarchyScoped({ source: "params", propertyPath: "id" })
  @ApiOperation({ summary: "Update a user (Admin/Manager only)" })
  @ApiParam({ name: "id", description: "User ID" })
  @ApiResponse({ status: 200, description: "User updated successfully" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "User not found" })
  async update(@Param("id") id: number, @Body() updateUserDto: UpdateUserDto) {
    updateUserDto.id = id;
    return await this.usersService.update(id, updateUserDto);
  }

  @Patch(":id/complete-registration")
  @HierarchyScoped({ source: "params", propertyPath: "id", allowSelf: true })
  @ApiOperation({ summary: "Complete user registration" })
  @ApiParam({ name: "id", description: "User ID" })
  @ApiResponse({ status: 200, description: "Registration completed" })
  @ApiResponse({
    status: 403,
    description: "Can only complete own registration",
  })
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
  @ApiOperation({ summary: "Delete a user (Admin only)" })
  @ApiParam({ name: "id", description: "User ID" })
  @ApiResponse({ status: 200, description: "User deleted successfully" })
  @ApiResponse({ status: 403, description: "Forbidden - Admin role required" })
  @ApiResponse({ status: 404, description: "User not found" })
  async remove(@Param("id") id: number) {
    return await this.usersService.remove(id);
  }
}
