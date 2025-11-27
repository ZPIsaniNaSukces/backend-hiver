import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateGeneralRequestDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  description: string;
}
