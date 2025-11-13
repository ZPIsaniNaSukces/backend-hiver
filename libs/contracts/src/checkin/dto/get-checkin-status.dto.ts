import { IsInt } from "class-validator";

export class GetCheckinStatusDto {
  @IsInt()
  userId!: number;
}
