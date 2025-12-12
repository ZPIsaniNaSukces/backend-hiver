import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Health")
@Controller("users-app")
export class UsersAppController {
  @Get("health")
  @ApiOperation({ summary: "Health check for users app" })
  @ApiResponse({ status: 200, description: "Users app is healthy" })
  healthCheck(): string {
    return "Users app is healthy";
  }
}
