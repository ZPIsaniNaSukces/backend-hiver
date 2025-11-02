import { IsDate, IsNotEmpty, IsOptional } from "class-validator";

export class CreateTaskDto {
  @IsDate()
  @IsOptional()
  dueDate?: string;

  @IsDate()
  @IsNotEmpty()
  createdAt: string;

  @IsDate()
  @IsNotEmpty()
  updatedAt: string;
}
