import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";

import { NotificationType } from "./enums";

export class SendNotificationDto {
  @IsNotEmpty()
  userId!: number;

  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsNotEmpty()
  @IsString()
  message!: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class CreateNotificationDto {
  @IsNotEmpty()
  userId!: number;

  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsNotEmpty()
  @IsString()
  message!: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}
