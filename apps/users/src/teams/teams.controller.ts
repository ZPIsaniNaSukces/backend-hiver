import {
  CreateTeamDto,
  TeamsMessageTopic,
  UpdateTeamDto,
} from "@app/contracts/teams";

import { Controller, ParseIntPipe } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";

import { TeamsService } from "./teams.service";

@Controller()
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @MessagePattern(TeamsMessageTopic.CREATE)
  async create(@Payload() createTeamDto: CreateTeamDto) {
    return await this.teamsService.create(createTeamDto);
  }

  @MessagePattern(TeamsMessageTopic.FIND_ALL)
  async findAll() {
    return await this.teamsService.findAll();
  }

  @MessagePattern(TeamsMessageTopic.FIND_ONE)
  async findOne(@Payload(ParseIntPipe) id: number) {
    return await this.teamsService.findOne(id);
  }

  @MessagePattern(TeamsMessageTopic.UPDATE)
  async update(@Payload(ParseIntPipe) updateTeamDto: UpdateTeamDto) {
    return await this.teamsService.update(updateTeamDto.id, updateTeamDto);
  }

  @MessagePattern(TeamsMessageTopic.REMOVE)
  async remove(@Payload(ParseIntPipe) id: number) {
    return await this.teamsService.remove(id);
  }
}
