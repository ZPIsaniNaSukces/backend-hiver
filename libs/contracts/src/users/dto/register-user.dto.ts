import { Type } from "class-transformer";
import { IsEmail, IsInt, IsOptional } from "class-validator";

export class RegisterUserDto {
  @IsEmail()
  email!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bossId?: number;
}
