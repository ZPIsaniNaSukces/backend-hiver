import { Type } from "class-transformer";
import { IsDate, IsOptional, IsString, MinLength } from "class-validator";

export class CompleteRegistrationDto {
  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateOfBirth?: Date;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string; //user can change the generated default password
}
