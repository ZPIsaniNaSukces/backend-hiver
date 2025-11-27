import { Type } from "class-transformer";
import { IsInt, IsOptional } from "class-validator";

import { PartialType } from "@nestjs/mapped-types";

import { CreateLeaveRequestDto } from "./create-leave-request.dto";

export class UpdateLeaveRequestDto extends PartialType(CreateLeaveRequestDto) {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: number;
}
