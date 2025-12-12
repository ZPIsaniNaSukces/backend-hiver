import { IsInt, IsNotEmpty, IsString } from "class-validator";

import { ApiProperty } from "@nestjs/swagger";

export class CreateGeneralRequestDto {
  @ApiProperty({ example: 1, description: "User ID submitting the request" })
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    example: "Request for new equipment",
    description: "Description of the general request",
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}
