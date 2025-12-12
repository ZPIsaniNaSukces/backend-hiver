import {
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from "class-validator";

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import { NotificationType } from "../enums";

export class SendNotificationDto {
  @ApiProperty({ example: 1, description: "Recipient user ID" })
  @IsNotEmpty()
  userId!: number;

  @ApiProperty({ enum: NotificationType, enumName: "NotificationType" })
  @IsEnum(NotificationType)
  type!: NotificationType;

  @ApiPropertyOptional({
    example: "Welcome",
    description: "Notification subject",
  })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ example: "Hello world", description: "Notification content" })
  @IsNotEmpty()
  @IsString()
  message!: string;

  @ApiPropertyOptional({
    description: "Additional metadata payload",
    type: Object,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}

export class CreateNotificationDto {
  @ApiProperty({ example: 1, description: "Recipient user ID" })
  @IsNotEmpty()
  userId!: number;

  @ApiProperty({ enum: NotificationType, enumName: "NotificationType" })
  @IsEnum(NotificationType)
  type!: NotificationType;

  @ApiPropertyOptional({
    example: "Welcome",
    description: "Notification subject",
  })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ example: "Hello world", description: "Notification content" })
  @IsNotEmpty()
  @IsString()
  message!: string;

  @ApiPropertyOptional({
    description: "Additional metadata payload",
    type: Object,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
