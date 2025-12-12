import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Health")
@Controller("presence-app")
export class PresenceAppController {
  @Get("health")
  @ApiOperation({ summary: "Health check for presence app" })
  @ApiResponse({ status: 200, description: "Presence app is healthy" })
  healthCheck(): string {
    return "Presence app is healthy";
  }
}
