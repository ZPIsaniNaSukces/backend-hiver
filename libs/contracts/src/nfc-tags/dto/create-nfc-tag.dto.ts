import {
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

import { ApiProperty } from "@nestjs/swagger";

export class CreateNfcTagDto {
  @ApiProperty({
    example: "04:A2:B3:C4:D5:E6:F7",
    description: "Unique identifier of the NFC tag",
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  uid!: string;

  @ApiProperty({
    example: "Office Entrance Tag",
    description: "Friendly name for the NFC tag",
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: 1, description: "Company ID" })
  @IsInt()
  companyId!: number;

  @ApiProperty({
    example: "0123456789abcdef",
    description: "AES encryption key for the tag",
    minLength: 16,
    maxLength: 64,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(16)
  @MaxLength(64)
  aesKey!: string;
}
