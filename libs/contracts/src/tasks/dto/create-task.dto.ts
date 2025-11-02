import { Type } from "class-transformer";
import { IsDate, IsInt, IsOptional } from "class-validator";

export class CreateTaskDto {
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
