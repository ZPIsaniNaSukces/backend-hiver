import { Type } from "class-transformer";
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class RegisterUserDto {
  @ApiProperty({ example: "user@example.com", description: "User email" })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: "Software Engineer",
    description: "User job title",
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: "John", description: "User first name" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: "Doe", description: "User last name" })
  @IsString()
  @IsNotEmpty()
  surname!: string;

  @ApiPropertyOptional({ example: 1, description: "ID of the user's manager" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bossId?: number;
}
