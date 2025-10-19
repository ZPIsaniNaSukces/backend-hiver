import {
  CreateTeamDto,
  TEAMS_MESSAGE_TOPICS,
  TeamsMessageTopic,
  UpdateTeamDto,
} from "@app/contracts/teams";

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

@Controller("teams")
export class TeamsController implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject("TEAMS_SERVICE") private readonly teamsClient: ClientKafka,
  ) {}

  async onModuleInit() {
    for (const pattern of TEAMS_MESSAGE_TOPICS) {
      this.teamsClient.subscribeToResponseOf(pattern);
    }
    await this.teamsClient.connect();
  }

  async onModuleDestroy() {
    await this.teamsClient.close();
  }

  @Post()
  create(@Body() createTeamDto: CreateTeamDto) {
    return this.teamsClient.send(TeamsMessageTopic.CREATE, createTeamDto);
  }

  @Get()
  findAll() {
    return this.teamsClient.send(TeamsMessageTopic.FIND_ALL, {});
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.teamsClient.send(TeamsMessageTopic.FIND_ONE, id);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateTeamDto: UpdateTeamDto,
  ) {
    updateTeamDto.id = id;
    return this.teamsClient.send(TeamsMessageTopic.UPDATE, updateTeamDto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.teamsClient.send(TeamsMessageTopic.REMOVE, id);
  }
}
