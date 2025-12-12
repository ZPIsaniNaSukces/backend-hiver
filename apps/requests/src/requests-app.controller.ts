import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@ApiTags("Health")
@Controller("requests-app")
export class RequestsAppController {
  @Get("health")
  @ApiOperation({ summary: "Health check for requests app" })
  @ApiResponse({ status: 200, description: "Requests app is healthy" })
  healthCheck(): string {
    return "Requests app is healthy";
  }
}
