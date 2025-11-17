import { Type } from "class-transformer";
import { IsEmail, IsInt, IsOptional } from "class-validator";

export class RegisterUserDto {
  @IsEmail()
  email!: string;

  @Type(() => Number)
  @IsInt()
  companyId!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bossId?: number;
}
