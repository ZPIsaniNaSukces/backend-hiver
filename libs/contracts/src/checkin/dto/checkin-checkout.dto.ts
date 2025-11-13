import { CheckinType } from "@generated/presence";
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class CheckinCheckoutDto {
  @IsString()
  @IsNotEmpty()
  tagUid!: string;

  @IsInt()
  counter!: number;

  @IsString()
  @IsOptional()
  signature?: string;

  @IsInt()
  userId!: number;

  @IsInt()
  companyId!: number;

  @IsEnum(CheckinType)
  @IsOptional()
  type?: CheckinType;
}
