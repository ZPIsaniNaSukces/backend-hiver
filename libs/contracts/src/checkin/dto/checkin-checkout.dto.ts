import { CheckinType } from "@generated/presence";
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CheckinCheckoutDto {
  @ApiProperty({
    example: "04:A2:B3:C4:D5:E6:F7",
    description: "NFC tag UID",
  })
  @IsString()
  @IsNotEmpty()
  tagUid!: string;

  @ApiProperty({
    example: 12_345,
    description: "Counter value for replay attack prevention",
  })
  @IsInt()
  counter!: number;

  @ApiPropertyOptional({
    example: "abc123signature",
    description: "Optional signature for verification",
  })
  @IsString()
  @IsOptional()
  signature?: string;

  @ApiProperty({ example: 1, description: "User ID performing check-in/out" })
  @IsInt()
  userId!: number;

  @ApiProperty({ example: 1, description: "Company ID" })
  @IsInt()
  companyId!: number;

  @ApiPropertyOptional({
    enum: CheckinType,
    description: "Type of check-in",
  })
  @IsEnum(CheckinType)
  @IsOptional()
  type?: CheckinType;
}
