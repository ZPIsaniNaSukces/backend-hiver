import { ACCOUNT_STATUS } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional } from "class-validator";

import { PartialType } from "@nestjs/mapped-types";
import { ApiPropertyOptional } from "@nestjs/swagger";

import { CreateUserDto } from "./create-user.dto";

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ example: 1, description: "User ID" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: number;

  @ApiPropertyOptional({
    enum: ACCOUNT_STATUS,
    example: "ACTIVE",
    description: "Account status",
  })
  @IsOptional()
  @IsEnum(ACCOUNT_STATUS)
  accountStatus?: ACCOUNT_STATUS;
}
