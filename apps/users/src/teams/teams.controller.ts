import { Controller, ParseIntPipe } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";

import { CreateTeamDto } from "./dto/create-team.dto";
import { UpdateTeamDto } from "./dto/update-team.dto";
import { TeamsService } from "./teams.service";

@Controller()
export class TeamsController {
  constructor(private readonly teamsService: TeamsService) {}

  @MessagePattern("createTeam")
  async create(@Payload() createTeamDto: CreateTeamDto) {
    return await this.teamsService.create(createTeamDto);
  }

  @MessagePattern("findAllTeams")
  async findAll() {
    return await this.teamsService.findAll();
  }

  @MessagePattern("findOneTeam")
  async findOne(@Payload(ParseIntPipe) id: number) {
    return await this.teamsService.findOne(id);
  }

  @MessagePattern("updateTeam")
  async update(@Payload(ParseIntPipe) updateTeamDto: UpdateTeamDto) {
    return await this.teamsService.update(updateTeamDto.id, updateTeamDto);
  }

  @MessagePattern("removeTeam")
  async remove(@Payload(ParseIntPipe) id: number) {
    return await this.teamsService.remove(id);
  }
}
