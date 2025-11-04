import { IsOptional, IsString, MinLength } from "class-validator";

export class CompleteRegistrationDto {
  @IsString()
  name: string;

  @IsString()
  surname: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string; //user can change the generated default password
}
