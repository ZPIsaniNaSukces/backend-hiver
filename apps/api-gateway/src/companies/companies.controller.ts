import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  OnModuleDestroy,
  OnModuleInit,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from "@nestjs/common";
import { ClientKafka } from "@nestjs/microservices";

import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";

@Controller("companies")
export class CompaniesController implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject("COMPANIES_SERVICE") private readonly companiesClient: ClientKafka,
  ) {}

  async onModuleInit() {
    const patterns = [
      "createCompany",
      "findAllCompanies",
      "findOneCompany",
      "updateCompany",
      "removeCompany",
    ];
    for (const pattern of patterns) {
      this.companiesClient.subscribeToResponseOf(pattern);
    }
    await this.companiesClient.connect();
  }

  async onModuleDestroy() {
    await this.companiesClient.close();
  }

  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesClient.send("createCompany", createCompanyDto);
  }

  @Get()
  findAll() {
    return this.companiesClient.send("findAllCompanies", {});
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.companiesClient.send("findOneCompany", id);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    updateCompanyDto.id = id;
    return this.companiesClient.send("updateCompany", updateCompanyDto);
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.companiesClient.send("removeCompany", id);
  }
}
