import { Type } from "class-transformer";
import { IsEmail, IsInt, IsOptional, IsString } from "class-validator";

export class UserCreatedEventDto {
  @Type(() => Number)
  @IsInt()
  id!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bossId?: number | null;

  @Type(() => Number)
  @IsInt()
  companyId!: number;

  @IsOptional()
  @IsString()
  name?: string | null;

  @IsOptional()
  @IsString()
  lastName?: string | null;

  @IsOptional()
  @IsString()
  title?: string | null;
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  phone!: string | null;
}
