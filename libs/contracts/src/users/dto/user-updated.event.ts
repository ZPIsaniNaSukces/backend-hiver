import { Type } from "class-transformer";
import { IsInt, IsOptional } from "class-validator";

export class UserUpdatedEventDto {
  @Type(() => Number)
  @IsInt()
  id!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bossId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  companyId?: number;
}
