import { JwtAuthGuard, RolesGuard } from "@app/auth";

import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { CompaniesService } from "./companies.service";

@ApiTags("Companies")
@ApiBearerAuth()
@Controller("companies")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  @ApiOperation({ summary: "Get all companies" })
  @ApiResponse({ status: 200, description: "Returns list of all companies" })
  async findAll() {
    return this.companiesService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a company by ID" })
  @ApiParam({ name: "id", description: "Company ID" })
  @ApiResponse({ status: 200, description: "Returns the company" })
  @ApiResponse({ status: 404, description: "Company not found" })
  async findOne(@Param("id") id: number) {
    return this.companiesService.findOne(id);
  }
}
