import { JwtAuthGuard, Roles, RolesGuard } from "@app/auth";
import { CreateTeamDto, UpdateTeamDto } from "@app/contracts/teams";
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

import { TeamsService } from "./teams.service";

@Controller("teams")
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @Roles(USER_ROLE.ADMIN)
  async create(@Body() createTeamDto: CreateTeamDto) {
    return this.teamsService.create(createTeamDto);
  }

  @Get()
  async findAll() {
    return this.teamsService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: number) {
    return this.teamsService.findOne(id);
  }

  @Patch(":id")
  @Roles(USER_ROLE.ADMIN)
  async update(@Param("id") id: number, @Body() updateTeamDto: UpdateTeamDto) {
    updateTeamDto.id = id;
    return this.teamsService.update(id, updateTeamDto);
  }

  @Delete(":id")
  @Roles(USER_ROLE.ADMIN)
  async remove(@Param("id") id: number) {
    return this.teamsService.remove(id);
  }
}
