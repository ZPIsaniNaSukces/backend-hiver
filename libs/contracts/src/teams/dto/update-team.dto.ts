import { Type } from "class-transformer";
import { IsInt, IsOptional } from "class-validator";

import { PartialType } from "@nestjs/mapped-types";
import { ApiPropertyOptional } from "@nestjs/swagger";

import { CreateTeamDto } from "./create-team.dto";

export class UpdateTeamDto extends PartialType(CreateTeamDto) {
  @ApiPropertyOptional({ example: 1, description: "Team ID" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: number;
}
