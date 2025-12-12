import { Type } from "class-transformer";
import { IsInt, IsOptional } from "class-validator";

import { PartialType } from "@nestjs/mapped-types";
import { ApiPropertyOptional } from "@nestjs/swagger";

import { CreateTaskDto } from "./create-task.dto";

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiPropertyOptional({ example: 1, description: "Task ID" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: number;
}
