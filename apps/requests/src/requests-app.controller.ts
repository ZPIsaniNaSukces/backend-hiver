import { Controller, Get } from "@nestjs/common";

@Controller("requests-app")
export class RequestsAppController {
  @Get("health")
  healthCheck(): string {
    return "Requests app is healthy";
  }
}
