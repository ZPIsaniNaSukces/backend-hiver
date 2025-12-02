import { Type } from "class-transformer";
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class RegisterUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  surname!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bossId?: number;
}
