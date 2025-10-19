import {
  COMPANIES_MESSAGE_TOPICS,
  CompaniesMessageTopic,
  CreateCompanyDto,
  UpdateCompanyDto,
} from "@app/contracts/companies";

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

@Controller("companies")
export class CompaniesController implements OnModuleInit, OnModuleDestroy {
  constructor(
    @Inject("COMPANIES_SERVICE") private readonly companiesClient: ClientKafka,
  ) {}

  async onModuleInit() {
    for (const pattern of COMPANIES_MESSAGE_TOPICS) {
      this.companiesClient.subscribeToResponseOf(pattern);
    }
    await this.companiesClient.connect();
  }

  async onModuleDestroy() {
    await this.companiesClient.close();
  }

  @Post()
  create(@Body() createCompanyDto: CreateCompanyDto) {
    return this.companiesClient.send(
      CompaniesMessageTopic.CREATE,
      createCompanyDto,
    );
  }

  @Get()
  findAll() {
    return this.companiesClient.send(CompaniesMessageTopic.FIND_ALL, {});
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.companiesClient.send(CompaniesMessageTopic.FIND_ONE, id);
  }

  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    updateCompanyDto.id = id;
    return this.companiesClient.send(
      CompaniesMessageTopic.UPDATE,
      updateCompanyDto,
    );
  }

  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.companiesClient.send(CompaniesMessageTopic.REMOVE, id);
  }
}
