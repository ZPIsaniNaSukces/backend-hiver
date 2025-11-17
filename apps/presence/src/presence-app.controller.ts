import { Controller, Get } from "@nestjs/common";

@Controller("presence-app")
export class PresenceAppController {
  @Get("health")
  healthCheck(): string {
    return "Presence app is healthy";
  }
}
