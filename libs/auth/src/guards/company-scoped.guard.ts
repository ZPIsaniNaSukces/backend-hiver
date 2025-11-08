import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { COMPANY_SCOPED_KEY } from "../decorators/company-scoped.decorator";
import type { CompanyScopedOptions } from "../decorators/company-scoped.decorator";
import type { AuthenticatedUser } from "../interfaces/authenticated-user.type";

type RequestContainer = Record<string, unknown> | undefined | null;

const DEFAULT_COMPANY_PROPERTY_PATH = "companyId";

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

function normalizeCompanyId(value: unknown): number | null {
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
export class CompanyScopedGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const metadata = this.reflector.getAllAndOverride<
      CompanyScopedOptions | undefined
    >(COMPANY_SCOPED_KEY, [context.getHandler(), context.getClass()]);

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

    const source = metadata.source ?? "body";
    const propertyPath = metadata.propertyPath ?? DEFAULT_COMPANY_PROPERTY_PATH;

    const container = (request as Record<string, unknown>)[source];
    const resolved = resolveProperty(
      propertyPath,
      container as RequestContainer,
    );
    const companyId = normalizeCompanyId(resolved);

    if (companyId == null) {
      throw new ForbiddenException("Unable to resolve target company");
    }

    if (companyId !== user.companyId) {
      throw new ForbiddenException("Cross-company access is not permitted");
    }

    return true;
  }
}
