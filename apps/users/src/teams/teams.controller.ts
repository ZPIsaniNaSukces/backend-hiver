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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { TeamsService } from "./teams.service";

@ApiTags("Teams")
@ApiBearerAuth()
@Controller("teams")
@UseGuards(JwtAuthGuard, RolesGuard)
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @Post()
  @Roles(USER_ROLE.ADMIN)
  @ApiOperation({ summary: "Create a new team (Admin only)" })
  @ApiResponse({ status: 201, description: "Team created successfully" })
  @ApiResponse({ status: 403, description: "Forbidden - Admin role required" })
  async create(
    @Body() createTeamDto: CreateTeamDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.teamsService.create(createTeamDto, admin.companyId);
  }

  @Get()
  @ApiOperation({ summary: "Get all teams" })
  @ApiResponse({ status: 200, description: "Returns list of all teams" })
  async findAll() {
    return this.teamsService.findAll();
  }

  @Get("managed")
  @Roles(USER_ROLE.MANAGER, USER_ROLE.ADMIN)
  @ApiOperation({
    summary: "Get teams managed by current user (Manager/Admin only)",
  })
  @ApiResponse({ status: 200, description: "Returns list of managed teams" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async findManaged(@CurrentUser() user: AuthenticatedUser) {
    return await this.teamsService.findManagedByUser(user.id);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a team by ID" })
  @ApiParam({ name: "id", description: "Team ID" })
  @ApiResponse({ status: 200, description: "Returns the team" })
  @ApiResponse({ status: 404, description: "Team not found" })
  async findOne(@Param("id") id: number) {
    return this.teamsService.findOne(id);
  }

  @Put(":id")
  @Roles(USER_ROLE.ADMIN)
  @ApiOperation({ summary: "Replace team members (Admin only)" })
  @ApiParam({ name: "id", description: "Team ID" })
  @ApiResponse({ status: 200, description: "Team updated successfully" })
  @ApiResponse({ status: 403, description: "Forbidden - Admin role required" })
  @ApiResponse({ status: 404, description: "Team not found" })
  async replaceMembers(
    @Param("id") id: number,
    @Body() updateTeamDto: UpdateTeamDto,
    @CurrentUser() admin: AuthenticatedUser,
  ) {
    return this.teamsService.update(id, updateTeamDto, admin.companyId);
  }

  @Delete(":id")
  @Roles(USER_ROLE.ADMIN)
  @ApiOperation({ summary: "Delete a team (Admin only)" })
  @ApiParam({ name: "id", description: "Team ID" })
  @ApiResponse({ status: 200, description: "Team deleted successfully" })
  @ApiResponse({ status: 403, description: "Forbidden - Admin role required" })
  @ApiResponse({ status: 404, description: "Team not found" })
  async remove(@Param("id") id: number) {
    return this.teamsService.remove(id);
  }
}
