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

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateTaskDto {
  @ApiProperty({
    example: "Complete project documentation",
    description: "Task title",
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    example: "Write comprehensive documentation for the API endpoints",
    description: "Task description",
    maxLength: 2000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({
    enum: TASK_STATUS,
    example: "TODO",
    description: "Task status",
  })
  @IsEnum(TASK_STATUS)
  @IsOptional()
  status?: TASK_STATUS;

  @ApiPropertyOptional({
    enum: TASK_TYPE,
    example: "FEATURE",
    description: "Task type",
  })
  @IsEnum(TASK_TYPE)
  @IsOptional()
  type?: TASK_TYPE;

  @ApiPropertyOptional({
    example: "2024-12-31",
    description: "Task due date",
    type: String,
    format: "date",
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  dueDate?: Date;

  @ApiPropertyOptional({
    example: 1,
    description: "ID of the user who reported/created the task",
  })
  @IsInt()
  @IsOptional()
  reporterId?: number;

  @ApiPropertyOptional({
    example: 2,
    description: "ID of the user assigned to the task",
  })
  @IsInt()
  @IsOptional()
  assigneeId?: number;
}
