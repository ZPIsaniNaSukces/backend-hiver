import { Controller, Get } from "@nestjs/common";

@Controller()
export class NotificationsController {
  @Get()
  getHealth(): string {
    return "Notifications service is running";
  }
}
