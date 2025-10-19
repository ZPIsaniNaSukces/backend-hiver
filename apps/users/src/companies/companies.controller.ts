import {
  CompaniesMessageTopic,
  CreateCompanyDto,
  UpdateCompanyDto,
} from "@app/contracts/companies";

import { BadRequestException, Controller, ParseIntPipe } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";

import { CompaniesService } from "./companies.service";

@Controller()
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @MessagePattern(CompaniesMessageTopic.CREATE)
  async create(@Payload() createCompanyDto: CreateCompanyDto) {
    return await this.companiesService.create(createCompanyDto);
  }

  @MessagePattern(CompaniesMessageTopic.FIND_ALL)
  async findAll() {
    return await this.companiesService.findAll();
  }

  @MessagePattern(CompaniesMessageTopic.FIND_ONE)
  async findOne(@Payload(ParseIntPipe) id: number) {
    return await this.companiesService.findOne(id);
  }

  @MessagePattern(CompaniesMessageTopic.UPDATE)
  async update(@Payload() updateCompanyDto: UpdateCompanyDto) {
    const { id } = updateCompanyDto;
    if (id == null) {
      throw new BadRequestException("id is required");
    }

    return await this.companiesService.update(id, updateCompanyDto);
  }

  @MessagePattern(CompaniesMessageTopic.REMOVE)
  async remove(@Payload(ParseIntPipe) id: number) {
    return await this.companiesService.remove(id);
  }
}
