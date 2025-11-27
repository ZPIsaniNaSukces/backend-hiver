import { IsDateString, IsEnum, IsInt, IsNotEmpty } from "class-validator";

export enum AvailabilityType {
  VACATION = "VACATION",
  ONLINE_WORK = "ONLINE_WORK",
  OFFLINE_WORK = "OFFLINE_WORK",
}

export class CreateAvailabilityRequestDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsDateString()
  @IsNotEmpty()
  date: string;

  @IsInt()
  @IsNotEmpty()
  hours: number;

  @IsEnum(AvailabilityType)
  @IsNotEmpty()
  type: AvailabilityType;
}
