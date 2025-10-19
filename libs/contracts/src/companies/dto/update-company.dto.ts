import { Type } from "class-transformer";
import { IsInt, IsOptional } from "class-validator";

import { PartialType } from "@nestjs/mapped-types";

import { CreateCompanyDto } from "./create-company.dto";

export class UpdateCompanyDto extends PartialType(CreateCompanyDto) {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  id?: number;
}
