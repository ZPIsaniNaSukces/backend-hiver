import { USER_ROLE } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiPropertyOptional({ example: "John", description: "User first name" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: "Doe", description: "User last name" })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  surname?: string;

  @ApiProperty({ example: "user@example.com", description: "User email" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "password123", description: "User password" })
  @IsString()
  @IsNotEmpty()
  password!: string;

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
    example: "Software Engineer",
    description: "User job title",
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    enum: USER_ROLE,
    example: "EMPLOYEE",
    description: "User role",
  })
  @IsEnum(USER_ROLE)
  role!: USER_ROLE;

  @ApiPropertyOptional({ example: 1, description: "ID of the user's manager" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bossId?: number;
}
