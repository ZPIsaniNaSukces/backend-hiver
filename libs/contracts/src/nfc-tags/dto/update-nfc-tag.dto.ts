import { IsInt, IsOptional } from "class-validator";

import { PartialType } from "@nestjs/mapped-types";
import { ApiPropertyOptional } from "@nestjs/swagger";

import { CreateNfcTagDto } from "./create-nfc-tag.dto";

export class UpdateNfcTagDto extends PartialType(CreateNfcTagDto) {
  @ApiPropertyOptional({ example: 1, description: "Company ID" })
  @IsInt()
  @IsOptional()
  companyId?: number;
}
