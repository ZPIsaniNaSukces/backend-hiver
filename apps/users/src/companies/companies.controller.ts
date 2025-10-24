import { JwtAuthGuard, RolesGuard } from "@app/auth";

import { Controller, Get, Param, UseGuards } from "@nestjs/common";

import { CompaniesService } from "./companies.service";

@Controller("companies")
@UseGuards(JwtAuthGuard, RolesGuard)
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get()
  async findAll() {
    return this.companiesService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: number) {
    return this.companiesService.findOne(id);
  }
}
