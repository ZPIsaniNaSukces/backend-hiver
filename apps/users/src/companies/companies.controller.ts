import { Controller, ParseIntPipe } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";

import { CompaniesService } from "./companies.service";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";

@Controller()
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @MessagePattern("createCompany")
  async create(@Payload() createCompanyDto: CreateCompanyDto) {
    return await this.companiesService.create(createCompanyDto);
  }

  @MessagePattern("findAllCompanies")
  async findAll() {
    return await this.companiesService.findAll();
  }

  @MessagePattern("findOneCompany")
  async findOne(@Payload(ParseIntPipe) id: number) {
    return await this.companiesService.findOne(id);
  }

  @MessagePattern("updateCompany")
  async update(
    @Payload(ParseIntPipe) id: number,
    @Payload() updateCompanyDto: UpdateCompanyDto,
  ) {
    return await this.companiesService.update(id, updateCompanyDto);
  }

  @MessagePattern("removeCompany")
  async remove(@Payload(ParseIntPipe) id: number) {
    return await this.companiesService.remove(id);
  }
}
