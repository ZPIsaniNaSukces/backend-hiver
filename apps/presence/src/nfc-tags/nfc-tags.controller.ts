import {
  CompanyScoped,
  CompanyScopedGuard,
  CurrentUser,
  JwtAuthGuard,
  Roles,
  RolesGuard,
} from "@app/auth";
import type { AuthenticatedUser } from "@app/auth";
import { CreateNfcTagDto, UpdateNfcTagDto } from "@app/contracts/nfc-tags";
import { USER_ROLE } from "@prisma/client";

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";

import { NfcTagsService } from "./nfc-tags.service";

@Controller("nfc-tags")
@UseGuards(JwtAuthGuard, RolesGuard)
export class NfcTagsController {
  constructor(private readonly nfcTagsService: NfcTagsService) {}

  @Post()
  @Roles(USER_ROLE.ADMIN, USER_ROLE.MANAGER)
  @CompanyScoped({ source: "body", propertyPath: "companyId" })
  @UseGuards(CompanyScopedGuard)
  async create(@Body() createNfcTagDto: CreateNfcTagDto) {
    return await this.nfcTagsService.create(createNfcTagDto);
  }

  @Get()
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    return await this.nfcTagsService.findAllForCompany(user.companyId);
  }

  @Get(":id")
  async findOne(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.nfcTagsService.findOneForCompany(id, user.companyId);
  }

  @Patch(":id")
  @Roles(USER_ROLE.ADMIN, USER_ROLE.MANAGER)
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDto: UpdateNfcTagDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.nfcTagsService.update(id, user.companyId, updateDto);
  }

  @Delete(":id")
  @Roles(USER_ROLE.ADMIN, USER_ROLE.MANAGER)
  async remove(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.nfcTagsService.remove(id, user.companyId);
    return { status: "ok" } as const;
  }
}
