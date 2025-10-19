import { USER_ROLE } from "@prisma/client";

import { ForbiddenException } from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";

import type { AuthenticatedUser } from "../interfaces/authenticated-user.type";
import { RolesGuard } from "./roles.guard";

const createContext = (user?: Partial<AuthenticatedUser>): ExecutionContext => {
  return {
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as ExecutionContext;
};

describe("RolesGuard", () => {
  let reflector: jest.Mocked<Pick<Reflector, "getAllAndOverride">>;
  let guard: RolesGuard;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as jest.Mocked<Pick<Reflector, "getAllAndOverride">>;

    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it("allows access when no roles are required", () => {
    reflector.getAllAndOverride.mockReturnValueOnce(null);

    const result = guard.canActivate(createContext());

    expect(result).toBe(true);
  });

  it("throws when the user is missing", () => {
    reflector.getAllAndOverride.mockReturnValueOnce([USER_ROLE.ADMIN]);

    expect(() => guard.canActivate(createContext(undefined))).toThrow(
      new ForbiddenException("User is not authenticated"),
    );
  });

  it("throws when the user does not have the required role", () => {
    reflector.getAllAndOverride.mockReturnValueOnce([USER_ROLE.ADMIN]);

    const context = createContext({
      role: USER_ROLE.EMPLOYEE,
    });

    expect(() => guard.canActivate(context)).toThrow(
      new ForbiddenException("Insufficient permissions"),
    );
  });

  it("allows access when the user role matches", () => {
    reflector.getAllAndOverride.mockReturnValueOnce([USER_ROLE.ADMIN]);

    const context = createContext({
      role: USER_ROLE.ADMIN,
    });

    const result = guard.canActivate(context);

    expect(result).toBe(true);
  });
});
