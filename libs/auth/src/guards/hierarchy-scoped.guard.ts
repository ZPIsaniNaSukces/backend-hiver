import { USER_ROLE } from "@prisma/client";

import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  Optional,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { HIERARCHY_SCOPED_KEY } from "../decorators/hierarchy-scoped.decorator";
import type { HierarchyScopedOptions } from "../decorators/hierarchy-scoped.decorator";
import type { AuthenticatedUser } from "../interfaces/authenticated-user.type";
import type { HierarchyService } from "../interfaces/hierarchy.interface";
import { HIERARCHY_SERVICE } from "../interfaces/hierarchy.interface";

type RequestContainer = Record<string, unknown> | undefined | null;

const DEFAULT_USER_ID_PROPERTY_PATH = "id";

function resolveProperty(path: string, container: RequestContainer): unknown {
  if (container == null) {
    return undefined;
  }

  let current: unknown = container;
  for (const key of path.split(".")) {
    if (current == null || typeof current !== "object") {
      return undefined;
    }

    current = (current as Record<string, unknown>)[key];
  }

  return current;
}

function normalizeUserId(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.trunc(value);
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}

@Injectable()
export class HierarchyScopedGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Optional()
    @Inject(HIERARCHY_SERVICE)
    private readonly hierarchyService?: HierarchyService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metadata = this.reflector.getAllAndOverride<
      HierarchyScopedOptions | undefined
    >(HIERARCHY_SCOPED_KEY, [context.getHandler(), context.getClass()]);

    if (metadata == null) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: AuthenticatedUser } & Record<string, unknown>>();

    const user = request.user;

    if (user == null) {
      throw new ForbiddenException("User context is missing");
    }

    // ADMINs can always access (hierarchy check is bypassed)
    if (user.role === USER_ROLE.ADMIN) {
      return true;
    }

    const source = metadata.source ?? "params";
    const propertyPath = metadata.propertyPath ?? DEFAULT_USER_ID_PROPERTY_PATH;
    const allowSelf = metadata.allowSelf ?? true;
    const allowMissing = metadata.allowMissing ?? false;

    const container = (request as Record<string, unknown>)[source];
    const resolved = resolveProperty(
      propertyPath,
      container as RequestContainer,
    );
    const targetUserId = normalizeUserId(resolved);

    // If target user ID is not provided and allowMissing is true, skip the check
    if (targetUserId == null) {
      if (allowMissing) {
        return true;
      }
      throw new ForbiddenException("Unable to resolve target user");
    }

    // Allow users to modify themselves if allowSelf is true
    if (allowSelf && targetUserId === user.id) {
      return true;
    }

    // Only MANAGERs can proceed past this point
    if (user.role !== USER_ROLE.MANAGER) {
      throw new ForbiddenException(
        "Only admins and managers can modify other users",
      );
    }

    // Verify hierarchy service is available
    if (this.hierarchyService == null) {
      throw new ForbiddenException(
        "Hierarchy service not configured. Cannot verify hierarchy permissions.",
      );
    }

    // Check if the target user is in the same company
    const targetUserInfo =
      await this.hierarchyService.findUserInfo(targetUserId);
    if (targetUserInfo == null) {
      throw new ForbiddenException("Target user not found");
    }

    if (targetUserInfo.companyId !== user.companyId) {
      throw new ForbiddenException("Cross-company access is not permitted");
    }

    // Check if current user is above target user in hierarchy
    const isAbove = await this.hierarchyService.isAboveInHierarchy(
      user.id,
      targetUserId,
    );

    if (!isAbove) {
      throw new ForbiddenException(
        "You can only modify users below you in the hierarchy",
      );
    }

    return true;
  }
}
