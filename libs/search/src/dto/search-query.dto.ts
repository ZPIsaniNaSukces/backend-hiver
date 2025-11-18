import { IsOptional, IsString, MinLength } from "class-validator";

export class SearchQueryDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  search?: string;
}
