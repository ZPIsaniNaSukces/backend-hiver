import { IsDateString, IsEnum, IsInt, IsNotEmpty } from "class-validator";

import { ApiProperty } from "@nestjs/swagger";

export enum AvailabilityType {
  VACATION = "VACATION",
  ONLINE_WORK = "ONLINE_WORK",
  OFFLINE_WORK = "OFFLINE_WORK",
}

export class CreateAvailabilityRequestDto {
  @ApiProperty({ example: 1, description: "User ID submitting the request" })
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    example: "2024-12-25",
    description: "Date for the availability request",
    type: String,
    format: "date",
  })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({
    example: 8,
    description: "Number of hours",
  })
  @IsInt()
  @IsNotEmpty()
  hours: number;

  @ApiProperty({
    enum: AvailabilityType,
    enumName: "AvailabilityType",
    example: "VACATION",
    description: "Type of availability",
  })
  @IsEnum(AvailabilityType)
  @IsNotEmpty()
  type: AvailabilityType;
}
