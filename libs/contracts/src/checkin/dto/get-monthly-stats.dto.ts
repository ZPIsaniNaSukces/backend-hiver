import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class GetMonthlyStatsDto {
  @ApiProperty({ example: 1, description: "User ID to get monthly stats for" })
  @IsInt()
  @Type(() => Number)
  userId!: number;

  @ApiPropertyOptional({
    example: 12,
    description: "Month (1-12)",
    minimum: 1,
    maximum: 12,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  month?: number;

  @ApiPropertyOptional({
    example: 2024,
    description: "Year",
    minimum: 2000,
  })
  @IsInt()
  @IsOptional()
  @Min(2000)
  @Type(() => Number)
  year?: number;
}
