import { Controller, ParseIntPipe } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";

import { CreateUserDto } from "../../../api-gateway/src/users/dto/create-user.dto";
import { UpdateUserDto } from "../../../api-gateway/src/users/dto/update-user.dto";
import { UsersService } from "./users.service";

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @MessagePattern("createUser")
  async create(@Payload() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @MessagePattern("findAllUsers")
  async findAll() {
    return await this.usersService.findAll();
  }

  @MessagePattern("findOneUser")
  async findOne(@Payload(ParseIntPipe) id: number) {
    return await this.usersService.findOne(id);
  }

  @MessagePattern("updateUser")
  async update(@Payload() updateUserDto: UpdateUserDto) {
    return await this.usersService.update(updateUserDto.id, updateUserDto);
  }

  @MessagePattern("removeUser")
  async remove(@Payload(ParseIntPipe) id: number) {
    return await this.usersService.remove(id);
  }
}
