import { IsInt, IsOptional } from "class-validator";

import { PartialType } from "@nestjs/mapped-types";

import { CreateNfcTagDto } from "./create-nfc-tag.dto";

export class UpdateNfcTagDto extends PartialType(CreateNfcTagDto) {
  @IsInt()
  @IsOptional()
  companyId?: number;
}
