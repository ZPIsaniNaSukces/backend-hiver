import { Type } from "class-transformer";
import { IsInt, IsOptional } from "class-validator";

import { PartialType } from "@nestjs/mapped-types";

import { CreateTeamDto } from "./create-team.dto";

export class UpdateTeamDto extends PartialType(CreateTeamDto) {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: number;
}
