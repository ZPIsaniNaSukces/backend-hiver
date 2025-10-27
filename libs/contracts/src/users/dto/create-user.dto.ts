import { USER_ROLE } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsString()
  @IsNotEmpty()
  surname?: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(USER_ROLE)
  role!: USER_ROLE;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bossId?: number;

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  teamIds?: number[];

  @Type(() => Number)
  @IsInt()
  companyId!: number;
}
