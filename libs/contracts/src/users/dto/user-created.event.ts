import { Type } from "class-transformer";
import { IsInt, IsOptional } from "class-validator";

export class UserCreatedEventDto {
  @Type(() => Number)
  @IsInt()
  id!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bossId?: number | null;

  @Type(() => Number)
  @IsInt()
  companyId!: number;
}
