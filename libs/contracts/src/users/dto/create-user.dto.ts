import { USER_ROLE } from "@prisma/client";
import { Type } from "class-transformer";
import {
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
  name!: string;

  @IsString()
  @IsNotEmpty()
  surname!: string;

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
  teamId?: number;

  @Type(() => Number)
  @IsInt()
  companyId!: number;
}
