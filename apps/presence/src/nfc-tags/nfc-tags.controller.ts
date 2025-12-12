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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { NfcTagsService } from "./nfc-tags.service";

@ApiTags("NFC Tags")
@ApiBearerAuth()
@Controller("nfc-tags")
@UseGuards(JwtAuthGuard, RolesGuard)
export class NfcTagsController {
  constructor(private readonly nfcTagsService: NfcTagsService) {}

  @Post()
  @Roles(USER_ROLE.ADMIN, USER_ROLE.MANAGER)
  @CompanyScoped({ source: "body", propertyPath: "companyId" })
  @UseGuards(CompanyScopedGuard)
  @ApiOperation({ summary: "Create a new NFC tag (Admin/Manager only)" })
  @ApiResponse({ status: 201, description: "NFC tag created successfully" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  async create(@Body() createNfcTagDto: CreateNfcTagDto) {
    return await this.nfcTagsService.create(createNfcTagDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all NFC tags for current company" })
  @ApiResponse({ status: 200, description: "Returns list of NFC tags" })
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    return await this.nfcTagsService.findAllForCompany(user.companyId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an NFC tag by ID" })
  @ApiParam({ name: "id", description: "NFC tag ID" })
  @ApiResponse({ status: 200, description: "Returns the NFC tag" })
  @ApiResponse({ status: 404, description: "NFC tag not found" })
  async findOne(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.nfcTagsService.findOneForCompany(id, user.companyId);
  }

  @Patch(":id")
  @Roles(USER_ROLE.ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({ summary: "Update an NFC tag (Admin/Manager only)" })
  @ApiParam({ name: "id", description: "NFC tag ID" })
  @ApiResponse({ status: 200, description: "NFC tag updated successfully" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "NFC tag not found" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateDto: UpdateNfcTagDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.nfcTagsService.update(id, user.companyId, updateDto);
  }

  @Delete(":id")
  @Roles(USER_ROLE.ADMIN, USER_ROLE.MANAGER)
  @ApiOperation({ summary: "Delete an NFC tag (Admin/Manager only)" })
  @ApiParam({ name: "id", description: "NFC tag ID" })
  @ApiResponse({ status: 200, description: "NFC tag deleted successfully" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "NFC tag not found" })
  async remove(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.nfcTagsService.remove(id, user.companyId);
    return { status: "ok" } as const;
  }
}
