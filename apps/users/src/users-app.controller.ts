import { Controller, Get } from "@nestjs/common";

@Controller("users-app")
export class UsersAppController {
  @Get("health")
  healthCheck(): string {
    return "Users app is healthy";
  }
}
