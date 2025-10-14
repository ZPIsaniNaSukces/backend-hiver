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

import { CreateTeamDto } from "./dto/create-team.dto";
import { UpdateTeamDto } from "./dto/update-team.dto";

@Controller("teams")
export class TeamsController implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject("TEAMS_SERVICE") private readonly teamsClient: ClientKafka,
  ) {}

  async onModuleInit() {
    const patterns = [
      "createTeam",
      "findAllTeams",
      "findOneTeam",
      "updateTeam",
      "removeTeam",
    ];
    for (const pattern of patterns) {
      this.teamsClient.subscribeToResponseOf(pattern);
    }
    await this.teamsClient.connect();
  }

  async onModuleDestroy() {
    await this.teamsClient.close();
  }

  @Post()
  create(@Body() createTeamDto: CreateTeamDto) {
    return this.teamsClient.send("createTeam", createTeamDto);
  }

  @Get()
  findAll() {
    return this.teamsClient.send("findAllTeams", {});
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.teamsClient.send("findOneTeam", id);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    updateTeamDto.id = id;
    return this.teamsClient.send("updateTeam", updateTeamDto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.teamsClient.send("removeTeam", id);
  }
}
