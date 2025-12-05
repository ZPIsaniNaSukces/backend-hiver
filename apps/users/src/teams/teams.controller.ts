import type { AuthenticatedUser } from "@app/auth";
import { CurrentUser, JwtAuthGuard, Roles, RolesGuard } from "@app/auth";
import { CreateTeamDto, UpdateTeamDto } from "@app/contracts/teams";
import { USER_ROLE } from "@prisma/client";

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";

import { TeamsService } from "./teams.service";

@Controller("teams")
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @Roles(USER_ROLE.ADMIN)
  async create(
    @Body() createTeamDto: CreateTeamDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.teamsService.create(createTeamDto, admin.companyId);
  }

  @Get()
  async findAll() {
    return this.teamsService.findAll();
  }

  @Get("managed")
  @Roles(USER_ROLE.MANAGER, USER_ROLE.ADMIN)
  async findManaged(@CurrentUser() user: AuthenticatedUser) {
    return await this.teamsService.findManagedByUser(user.id);
  }

  @Get(":id")
  async findOne(@Param("id") id: number) {
    return this.teamsService.findOne(id);
  }

  @Put(":id")
  @Roles(USER_ROLE.ADMIN)
  async replaceMembers(
    @Param("id") id: number,
    @Body() updateTeamDto: UpdateTeamDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.teamsService.update(id, updateTeamDto, admin.companyId);
  }

  @Delete(":id")
  @Roles(USER_ROLE.ADMIN)
  async remove(@Param("id") id: number) {
    return this.teamsService.remove(id);
  }
}
