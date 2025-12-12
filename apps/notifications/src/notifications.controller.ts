import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Health")
@Controller()
export class NotificationsController {
  @Get()
  @ApiOperation({ summary: "Health check for notifications service" })
  @ApiResponse({ status: 200, description: "Notifications service is running" })
  getHealth(): string {
    return "Notifications service is running";
  }
}
