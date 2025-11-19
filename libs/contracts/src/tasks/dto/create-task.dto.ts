import { TASK_STATUS, TASK_TYPE } from "@generated/tasks";
import { Type } from "class-transformer";
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateTaskDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsEnum(TASK_STATUS)
  @IsOptional()
  status?: TASK_STATUS;

  @IsEnum(TASK_TYPE)
  @IsOptional()
  type?: TASK_TYPE;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dueDate?: Date;

  @IsInt()
  @IsOptional()
  reporterId?: number;

  @IsInt()
  @IsOptional()
  assigneeId?: number;
}
