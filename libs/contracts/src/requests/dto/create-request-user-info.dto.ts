import { IsInt, IsNotEmpty, IsOptional } from "class-validator";

export class CreateRequestUserInfoDto {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsInt()
  @IsOptional()
  bossId?: number | null;

  @IsInt()
  @IsNotEmpty()
  companyId: number;

  @IsInt()
  @IsOptional()
  availableLeaveHours?: number;
}
