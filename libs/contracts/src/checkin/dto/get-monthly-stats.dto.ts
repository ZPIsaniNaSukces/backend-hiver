import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

export class GetMonthlyStatsDto {
  @IsInt()
  @Type(() => Number)
  userId!: number;

  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month?: number;

  @IsInt()
  @IsOptional()
  @Min(2000)
  @Type(() => Number)
  year?: number;
}
