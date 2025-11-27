import { ACCOUNT_STATUS, USER_ROLE } from "@prisma/client";

import { ForbiddenException } from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";

import type { HierarchyScopedOptions } from "../decorators/hierarchy-scoped.decorator";
import type { AuthenticatedUser } from "../interfaces/authenticated-user.type";
import type {
  HierarchyService,
  HierarchyUserInfo,
} from "../interfaces/hierarchy.interface";
import { HierarchyScopedGuard } from "./hierarchy-scoped.guard";

const createMockUser = (
  overrides: Partial<AuthenticatedUser> = {},
): AuthenticatedUser => ({
  id: 1,
  name: "Test",
  surname: "User",
  email: "test@example.com",
  role: USER_ROLE.EMPLOYEE,
  phone: null,
  dateOfBirth: null,
  title: null,
  bossId: null,
  teamIds: [],
  teams: [],
  companyId: 1,
  accountStatus: ACCOUNT_STATUS.VERIFIED,
  ...overrides,
});

const createContext = (
  user?: AuthenticatedUser,
  requestData: { body?: unknown; params?: unknown; query?: unknown } = {},
): ExecutionContext => {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        user,
        body: requestData.body ?? {},
        params: requestData.params ?? {},
        query: requestData.query ?? {},
      }),
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as ExecutionContext;
};

const createMockHierarchyService = (): jest.Mocked<HierarchyService> => ({
  findUserInfo: jest.fn(),
  isAboveInHierarchy: jest.fn(),
});

describe("HierarchyScopedGuard", () => {
  let reflector: jest.Mocked<Pick<Reflector, "getAllAndOverride">>;
  let hierarchyService: jest.Mocked<HierarchyService>;
  let guard: HierarchyScopedGuard;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as jest.Mocked<Pick<Reflector, "getAllAndOverride">>;

    hierarchyService = createMockHierarchyService();

    guard = new HierarchyScopedGuard(
      reflector as unknown as Reflector,
      hierarchyService,
    );
  });

  describe("when no metadata is present", () => {
    it("allows access when @HierarchyScoped is not applied", async () => {
      reflector.getAllAndOverride.mockReturnValueOnce(null);

      const result = await guard.canActivate(createContext(createMockUser()));

      expect(result).toBe(true);
    });
  });

  describe("when user context is missing", () => {
    it("throws ForbiddenException when user is not authenticated", async () => {
      reflector.getAllAndOverride.mockReturnValueOnce({});

      await expect(guard.canActivate(createContext(undefined))).rejects.toThrow(
        new ForbiddenException("User context is missing"),
      );
    });
  });

  describe("when user is ADMIN", () => {
    it("allows access unconditionally", async () => {
      reflector.getAllAndOverride.mockReturnValueOnce({});
      const adminUser = createMockUser({ role: USER_ROLE.ADMIN });

      const result = await guard.canActivate(
        createContext(adminUser, { params: { id: "999" } }),
      );

      expect(result).toBe(true);
      expect(hierarchyService.findUserInfo).not.toHaveBeenCalled();
    });
  });

  describe("when allowSelf is true", () => {
    it("allows users to modify themselves", async () => {
      const options: HierarchyScopedOptions = {
        source: "params",
        propertyPath: "id",
        allowSelf: true,
      };
      reflector.getAllAndOverride.mockReturnValueOnce(options);

      const user = createMockUser({ id: 5, role: USER_ROLE.EMPLOYEE });
      const context = createContext(user, { params: { id: "5" } });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(hierarchyService.findUserInfo).not.toHaveBeenCalled();
    });

    it("allows managers to modify themselves", async () => {
      const options: HierarchyScopedOptions = {
        source: "params",
        propertyPath: "id",
        allowSelf: true,
      };
      reflector.getAllAndOverride.mockReturnValueOnce(options);

      const user = createMockUser({ id: 10, role: USER_ROLE.MANAGER });
      const context = createContext(user, { params: { id: "10" } });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe("when allowMissing is true", () => {
    it("allows access when target user ID is not provided", async () => {
      const options: HierarchyScopedOptions = {
        source: "body",
        propertyPath: "assigneeId",
        allowMissing: true,
      };
      reflector.getAllAndOverride.mockReturnValueOnce(options);

      const user = createMockUser({ role: USER_ROLE.MANAGER });
      const context = createContext(user, { body: {} });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it("allows access when target user ID is null", async () => {
      const options: HierarchyScopedOptions = {
        source: "body",
        propertyPath: "assigneeId",
        allowMissing: true,
      };
      reflector.getAllAndOverride.mockReturnValueOnce(options);

      const user = createMockUser({ role: USER_ROLE.MANAGER });
      const context = createContext(user, { body: { assigneeId: null } });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe("when allowMissing is false (default)", () => {
    it("throws when target user ID cannot be resolved", async () => {
      const options: HierarchyScopedOptions = {
        source: "params",
        propertyPath: "id",
      };
      reflector.getAllAndOverride.mockReturnValueOnce(options);

      const user = createMockUser({ role: USER_ROLE.MANAGER });
      const context = createContext(user, { params: {} });

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException("Unable to resolve target user"),
      );
    });
  });

  describe("when user is EMPLOYEE", () => {
    it("throws when trying to modify another user", async () => {
      const options: HierarchyScopedOptions = {
        source: "params",
        propertyPath: "id",
      };
      reflector.getAllAndOverride.mockReturnValueOnce(options);

      const user = createMockUser({ id: 1, role: USER_ROLE.EMPLOYEE });
      const context = createContext(user, { params: { id: "2" } });

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException(
          "Only admins and managers can modify other users",
        ),
      );
    });
  });

  describe("when user is MANAGER", () => {
    it("throws when hierarchy service is not configured", async () => {
      const guardWithoutService = new HierarchyScopedGuard(
        reflector as unknown as Reflector,
        undefined,
      );

      const options: HierarchyScopedOptions = {
        source: "params",
        propertyPath: "id",
      };
      reflector.getAllAndOverride.mockReturnValueOnce(options);

      const user = createMockUser({ id: 1, role: USER_ROLE.MANAGER });
      const context = createContext(user, { params: { id: "2" } });

      await expect(guardWithoutService.canActivate(context)).rejects.toThrow(
        new ForbiddenException(
          "Hierarchy service not configured. Cannot verify hierarchy permissions.",
        ),
      );
    });

    it("throws when target user is not found", async () => {
      const options: HierarchyScopedOptions = {
        source: "params",
        propertyPath: "id",
      };
      reflector.getAllAndOverride.mockReturnValueOnce(options);
      hierarchyService.findUserInfo.mockResolvedValueOnce(null);

      const user = createMockUser({ id: 1, role: USER_ROLE.MANAGER });
      const context = createContext(user, { params: { id: "999" } });

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException("Target user not found"),
      );
    });

    it("throws when target user is in a different company", async () => {
      const options: HierarchyScopedOptions = {
        source: "params",
        propertyPath: "id",
      };
      reflector.getAllAndOverride.mockReturnValueOnce(options);

      const targetUserInfo: HierarchyUserInfo = {
        id: 2,
        bossId: null,
        companyId: 99, // Different company
      };
      hierarchyService.findUserInfo.mockResolvedValueOnce(targetUserInfo);

      const user = createMockUser({
        id: 1,
        role: USER_ROLE.MANAGER,
        companyId: 1,
      });
      const context = createContext(user, { params: { id: "2" } });

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException("Cross-company access is not permitted"),
      );
    });

    it("throws when manager is not above target in hierarchy", async () => {
      const options: HierarchyScopedOptions = {
        source: "params",
        propertyPath: "id",
      };
      reflector.getAllAndOverride.mockReturnValueOnce(options);

      const targetUserInfo: HierarchyUserInfo = {
        id: 2,
        bossId: 10, // Different boss
        companyId: 1,
      };
      hierarchyService.findUserInfo.mockResolvedValueOnce(targetUserInfo);
      hierarchyService.isAboveInHierarchy.mockResolvedValueOnce(false);

      const user = createMockUser({
        id: 1,
        role: USER_ROLE.MANAGER,
        companyId: 1,
      });
      const context = createContext(user, { params: { id: "2" } });

      await expect(guard.canActivate(context)).rejects.toThrow(
        new ForbiddenException(
          "You can only modify users below you in the hierarchy",
        ),
      );
    });

    it("allows access when manager is above target in hierarchy", async () => {
      const options: HierarchyScopedOptions = {
        source: "params",
        propertyPath: "id",
      };
      reflector.getAllAndOverride.mockReturnValueOnce(options);

      const targetUserInfo: HierarchyUserInfo = {
        id: 2,
        bossId: 1,
        companyId: 1,
      };
      hierarchyService.findUserInfo.mockResolvedValueOnce(targetUserInfo);
      hierarchyService.isAboveInHierarchy.mockResolvedValueOnce(true);

      const user = createMockUser({
        id: 1,
        role: USER_ROLE.MANAGER,
        companyId: 1,
      });
      const context = createContext(user, { params: { id: "2" } });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(hierarchyService.isAboveInHierarchy).toHaveBeenCalledWith(1, 2);
    });
  });

  describe("property path resolution", () => {
    it("resolves nested property paths", async () => {
      const options: HierarchyScopedOptions = {
        source: "body",
        propertyPath: "data.user.id",
        allowSelf: true,
      };
      reflector.getAllAndOverride.mockReturnValueOnce(options);

      const user = createMockUser({ id: 42, role: USER_ROLE.EMPLOYEE });
      const context = createContext(user, {
        body: { data: { user: { id: 42 } } },
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it("handles string user IDs", async () => {
      const options: HierarchyScopedOptions = {
        source: "params",
        propertyPath: "id",
        allowSelf: true,
      };
      reflector.getAllAndOverride.mockReturnValueOnce(options);

      const user = createMockUser({ id: 123, role: USER_ROLE.EMPLOYEE });
      const context = createContext(user, { params: { id: "123" } });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it("handles numeric user IDs", async () => {
      const options: HierarchyScopedOptions = {
        source: "body",
        propertyPath: "userId",
        allowSelf: true,
      };
      reflector.getAllAndOverride.mockReturnValueOnce(options);

      const user = createMockUser({ id: 456, role: USER_ROLE.EMPLOYEE });
      const context = createContext(user, { body: { userId: 456 } });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });
  });

  describe("source resolution", () => {
    it("reads from body when source is body", async () => {
      const options: HierarchyScopedOptions = {
        source: "body",
        propertyPath: "targetId",
        allowSelf: true,
      };
      reflector.getAllAndOverride.mockReturnValueOnce(options);

      const user = createMockUser({ id: 1, role: USER_ROLE.EMPLOYEE });
      const context = createContext(user, {
        body: { targetId: 1 },
        params: { targetId: 999 },
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it("reads from query when source is query", async () => {
      const options: HierarchyScopedOptions = {
        source: "query",
        propertyPath: "userId",
        allowSelf: true,
      };
      reflector.getAllAndOverride.mockReturnValueOnce(options);

      const user = createMockUser({ id: 7, role: USER_ROLE.EMPLOYEE });
      const context = createContext(user, {
        query: { userId: "7" },
        params: { userId: "999" },
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it("defaults to params when source is not specified", async () => {
      const options: HierarchyScopedOptions = {
        propertyPath: "id",
        allowSelf: true,
      };
      reflector.getAllAndOverride.mockReturnValueOnce(options);

      const user = createMockUser({ id: 3, role: USER_ROLE.EMPLOYEE });
      const context = createContext(user, {
        params: { id: "3" },
        body: { id: 999 },
      });

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });
  });
});
