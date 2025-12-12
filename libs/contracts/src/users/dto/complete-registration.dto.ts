import { Type } from "class-transformer";
import { IsDate, IsOptional, IsString, MinLength } from "class-validator";

import { ApiPropertyOptional } from "@nestjs/swagger";

export class CompleteRegistrationDto {
  @ApiPropertyOptional({
    example: "+1234567890",
    description: "User phone number",
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    example: "1990-01-15",
    description: "User date of birth",
    type: String,
    format: "date",
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date;

  @ApiPropertyOptional({
    example: "newPassword123",
    description: "User can change the generated default password",
    minLength: 8,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string; //user can change the generated default password
}
