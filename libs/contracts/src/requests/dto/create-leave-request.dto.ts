import { LEAVE_STATUS } from "@prisma/client";
import { Type } from "class-transformer";
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateLeaveRequestDto {
  @Type(() => Number)
  @IsInt()
  userId!: number;

  @IsDateString()
  startsAt!: string;

  @IsDateString()
  endsAt!: string;

  @IsString()
  @IsNotEmpty()
  reason!: string;

  @IsEnum(LEAVE_STATUS)
  status!: LEAVE_STATUS;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  approvedById?: number;
}
