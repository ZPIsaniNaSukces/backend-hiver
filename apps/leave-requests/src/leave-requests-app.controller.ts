import { Controller, Get } from "@nestjs/common";

@Controller("leave-requests-app")
export class LeaveRequestsAppController {
  @Get("health")
  healthCheck(): string {
    return "Leave requests app is healthy";
  }
}
