import { Type } from "class-transformer";
import { IsInt, IsOptional } from "class-validator";

import { PartialType } from "@nestjs/mapped-types";

import { CreateLeaveRequestUserInfoDto } from "./create-leave-request-user-info.dto";

export class UpdateLeaveRequestUserInfoDto extends PartialType(
  CreateLeaveRequestUserInfoDto,
) {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: number;
}
