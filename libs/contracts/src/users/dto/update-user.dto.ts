import { ACCOUNT_STATUS } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional } from "class-validator";

import { PartialType } from "@nestjs/mapped-types";

import { CreateUserDto } from "./create-user.dto";

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: number;

  @IsOptional()
  @IsEnum(ACCOUNT_STATUS)
  accountStatus?: ACCOUNT_STATUS;
}
