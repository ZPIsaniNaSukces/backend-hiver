import type { HierarchyUserInfo } from "./hierarchy.interface";
import { BaseHierarchyService } from "./hierarchy.interface";

class MockHierarchyService extends BaseHierarchyService {
  private users: Map<number, HierarchyUserInfo> = new Map<
    number,
    HierarchyUserInfo
  >();

  setUsers(users: HierarchyUserInfo[]): void {
    this.users.clear();
    for (const user of users) {
      this.users.set(user.id, user);
    }
  }

  async findUserInfo(userId: number): Promise<HierarchyUserInfo | null> {
    return await Promise.resolve(this.users.get(userId) ?? null);
  }
}

describe("BaseHierarchyService", () => {
  let service: MockHierarchyService;

  beforeEach(() => {
    service = new MockHierarchyService();
  });

  describe("isAboveInHierarchy", () => {
    it("returns true when manager is direct boss of target", async () => {
      service.setUsers([
        { id: 1, bossId: null, companyId: 1 }, // Manager (no boss)
        { id: 2, bossId: 1, companyId: 1 }, // Target reports to Manager
      ]);

      const result = await service.isAboveInHierarchy(1, 2);

      expect(result).toBe(true);
    });

    it("returns true when manager is indirect boss (grandparent)", async () => {
      service.setUsers([
        { id: 1, bossId: null, companyId: 1 }, // CEO
        { id: 2, bossId: 1, companyId: 1 }, // Manager reports to CEO
        { id: 3, bossId: 2, companyId: 1 }, // Employee reports to Manager
      ]);

      const result = await service.isAboveInHierarchy(1, 3);

      expect(result).toBe(true);
    });

    it("returns true when manager is several levels above", async () => {
      service.setUsers([
        { id: 1, bossId: null, companyId: 1 }, // CEO
        { id: 2, bossId: 1, companyId: 1 }, // VP
        { id: 3, bossId: 2, companyId: 1 }, // Director
        { id: 4, bossId: 3, companyId: 1 }, // Manager
        { id: 5, bossId: 4, companyId: 1 }, // Employee
      ]);

      const result = await service.isAboveInHierarchy(1, 5);

      expect(result).toBe(true);
    });

    it("returns false when manager is not above target", async () => {
      service.setUsers([
        { id: 1, bossId: null, companyId: 1 }, // CEO
        { id: 2, bossId: 1, companyId: 1 }, // Manager A
        { id: 3, bossId: 1, companyId: 1 }, // Manager B (sibling of Manager A)
        { id: 4, bossId: 2, companyId: 1 }, // Employee under Manager A
      ]);

      // Manager B is not above Employee under Manager A
      const result = await service.isAboveInHierarchy(3, 4);

      expect(result).toBe(false);
    });

    it("returns false when target is above manager", async () => {
      service.setUsers([
        { id: 1, bossId: null, companyId: 1 }, // CEO
        { id: 2, bossId: 1, companyId: 1 }, // Manager
      ]);

      // Manager cannot modify CEO
      const result = await service.isAboveInHierarchy(2, 1);

      expect(result).toBe(false);
    });

    it("returns false when target user does not exist", async () => {
      service.setUsers([{ id: 1, bossId: null, companyId: 1 }]);

      const result = await service.isAboveInHierarchy(1, 999);

      expect(result).toBe(false);
    });

    it("returns false when target has no boss and manager is not found in chain", async () => {
      service.setUsers([
        { id: 1, bossId: null, companyId: 1 }, // CEO 1
        { id: 2, bossId: null, companyId: 1 }, // CEO 2 (different hierarchy)
      ]);

      const result = await service.isAboveInHierarchy(1, 2);

      expect(result).toBe(false);
    });

    it("returns false for same user (manager checking themselves)", async () => {
      service.setUsers([{ id: 1, bossId: null, companyId: 1 }]);

      const result = await service.isAboveInHierarchy(1, 1);

      expect(result).toBe(false);
    });

    it("handles circular reference without infinite loop", async () => {
      // This shouldn't happen in practice, but the guard should handle it
      service.setUsers([
        { id: 1, bossId: 3, companyId: 1 },
        { id: 2, bossId: 1, companyId: 1 },
        { id: 3, bossId: 2, companyId: 1 }, // Creates a cycle: 1 -> 3 -> 2 -> 1
      ]);

      // Should terminate and return false (manager 99 is not in the cycle)
      const result = await service.isAboveInHierarchy(99, 1);

      expect(result).toBe(false);
    });

    it("handles self-referencing boss (user is their own boss)", async () => {
      // Edge case: user points to themselves as boss
      service.setUsers([{ id: 1, bossId: 1, companyId: 1 }]);

      const result = await service.isAboveInHierarchy(2, 1);

      expect(result).toBe(false);
    });
  });

  describe("findUserInfo", () => {
    it("returns user info when user exists", async () => {
      const userInfo: HierarchyUserInfo = {
        id: 1,
        bossId: null,
        companyId: 1,
      };
      service.setUsers([userInfo]);

      const result = await service.findUserInfo(1);

      expect(result).toEqual(userInfo);
    });

    it("returns null when user does not exist", async () => {
      service.setUsers([]);

      const result = await service.findUserInfo(999);

      expect(result).toBeNull();
    });
  });

  describe("complex hierarchy scenarios", () => {
    beforeEach(() => {
      // Set up a realistic company hierarchy
      //
      //         CEO (1)
      //        /       \
      //     CTO (2)   CFO (3)
      //      |          |
      //  Dev Lead (4)  Accountant (6)
      //    /    \
      //  Dev (5) Dev (7)
      //
      service.setUsers([
        { id: 1, bossId: null, companyId: 1 }, // CEO
        { id: 2, bossId: 1, companyId: 1 }, // CTO
        { id: 3, bossId: 1, companyId: 1 }, // CFO
        { id: 4, bossId: 2, companyId: 1 }, // Dev Lead
        { id: 5, bossId: 4, companyId: 1 }, // Dev 1
        { id: 6, bossId: 3, companyId: 1 }, // Accountant
        { id: 7, bossId: 4, companyId: 1 }, // Dev 2
      ]);
    });

    it("CEO can modify anyone in the hierarchy", async () => {
      expect(await service.isAboveInHierarchy(1, 2)).toBe(true); // CTO
      expect(await service.isAboveInHierarchy(1, 3)).toBe(true); // CFO
      expect(await service.isAboveInHierarchy(1, 4)).toBe(true); // Dev Lead
      expect(await service.isAboveInHierarchy(1, 5)).toBe(true); // Dev 1
      expect(await service.isAboveInHierarchy(1, 6)).toBe(true); // Accountant
      expect(await service.isAboveInHierarchy(1, 7)).toBe(true); // Dev 2
    });

    it("CTO can only modify their branch", async () => {
      expect(await service.isAboveInHierarchy(2, 4)).toBe(true); // Dev Lead
      expect(await service.isAboveInHierarchy(2, 5)).toBe(true); // Dev 1
      expect(await service.isAboveInHierarchy(2, 7)).toBe(true); // Dev 2
      expect(await service.isAboveInHierarchy(2, 3)).toBe(false); // CFO (sibling)
      expect(await service.isAboveInHierarchy(2, 6)).toBe(false); // Accountant (different branch)
    });

    it("CFO can only modify their branch", async () => {
      expect(await service.isAboveInHierarchy(3, 6)).toBe(true); // Accountant
      expect(await service.isAboveInHierarchy(3, 2)).toBe(false); // CTO (sibling)
      expect(await service.isAboveInHierarchy(3, 4)).toBe(false); // Dev Lead
      expect(await service.isAboveInHierarchy(3, 5)).toBe(false); // Dev
    });

    it("Dev Lead can only modify their direct reports", async () => {
      expect(await service.isAboveInHierarchy(4, 5)).toBe(true); // Dev 1
      expect(await service.isAboveInHierarchy(4, 7)).toBe(true); // Dev 2
      expect(await service.isAboveInHierarchy(4, 2)).toBe(false); // CTO (boss)
      expect(await service.isAboveInHierarchy(4, 1)).toBe(false); // CEO
      expect(await service.isAboveInHierarchy(4, 6)).toBe(false); // Accountant
    });

    it("Dev cannot modify anyone", async () => {
      expect(await service.isAboveInHierarchy(5, 1)).toBe(false);
      expect(await service.isAboveInHierarchy(5, 2)).toBe(false);
      expect(await service.isAboveInHierarchy(5, 4)).toBe(false);
      expect(await service.isAboveInHierarchy(5, 7)).toBe(false); // peer
      expect(await service.isAboveInHierarchy(5, 6)).toBe(false);
    });

    it("siblings cannot modify each other", async () => {
      expect(await service.isAboveInHierarchy(5, 7)).toBe(false); // Dev 1 -> Dev 2
      expect(await service.isAboveInHierarchy(7, 5)).toBe(false); // Dev 2 -> Dev 1
      expect(await service.isAboveInHierarchy(2, 3)).toBe(false); // CTO -> CFO
      expect(await service.isAboveInHierarchy(3, 2)).toBe(false); // CFO -> CTO
    });
  });
});
