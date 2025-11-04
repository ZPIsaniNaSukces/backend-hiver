import { Type } from "class-transformer";
import { IsInt, IsOptional } from "class-validator";

export class CreateLeaveRequestUserInfoDto {
  @Type(() => Number)
  @IsInt()
  id!: number; // mirrors User.id

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bossId?: number | null;

  @Type(() => Number)
  @IsInt()
  companyId!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  availableLeaveDays?: number;
}
