import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsInt, IsOptional } from "class-validator";

import { PartialType } from "@nestjs/mapped-types";

import { CreateUserDto } from "./create-user.dto";

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: number;

  // Allow explicit clearing of teams by providing an empty array
  @IsOptional()
  @IsArray()
  teamIds?: number[];

  @IsOptional()
  @IsBoolean()
  isFirstLogin?: boolean;
}
