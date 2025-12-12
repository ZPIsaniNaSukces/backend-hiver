import { Type } from "class-transformer";
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateTeamDto {
  @ApiProperty({ example: "Engineering Team", description: "Team name" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 1, description: "ID of the team leader" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  leaderId?: number;

  @ApiPropertyOptional({
    example: [1, 2, 3],
    description: "Array of team member IDs",
    type: [Number],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  memberIds?: number[];
}
