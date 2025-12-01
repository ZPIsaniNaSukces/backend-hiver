import { Type } from "class-transformer";
<<<<<<< HEAD
import { IsInt, IsOptional, IsString } from "class-validator";
=======
import { IsEmail, IsInt, IsOptional, IsString } from "class-validator";
>>>>>>> 3b16702 (feat: enhance notifications module with email functionality and user event handling)

export class UserUpdatedEventDto {
  @Type(() => Number)
  @IsInt()
  id!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  bossId?: number | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  companyId?: number;

  @IsOptional()
<<<<<<< HEAD
  @IsString()
  name?: string | null;

  @IsOptional()
  @IsString()
  lastName?: string | null;

  @IsOptional()
  @IsString()
  title?: string | null;
=======
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string | null;
>>>>>>> 3b16702 (feat: enhance notifications module with email functionality and user event handling)
}
