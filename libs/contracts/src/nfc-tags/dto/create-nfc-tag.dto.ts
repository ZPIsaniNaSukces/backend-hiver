import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateNfcTagDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  uid!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsInt()
  companyId!: number;

  @IsString()
  @IsNotEmpty()
  @MinLength(16)
  @MaxLength(64)
  aesKey!: string;
}
