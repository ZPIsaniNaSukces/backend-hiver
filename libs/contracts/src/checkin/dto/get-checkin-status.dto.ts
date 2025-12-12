import { IsInt } from "class-validator";

import { ApiProperty } from "@nestjs/swagger";

export class GetCheckinStatusDto {
  @ApiProperty({
    example: 1,
    description: "User ID to get check-in status for",
  })
  @IsInt()
  userId!: number;
}
