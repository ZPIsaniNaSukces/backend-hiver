/**
 * Token used to inject the HierarchyService implementation
 */
export const HIERARCHY_SERVICE = Symbol("HIERARCHY_SERVICE");

/**
 * Basic user info needed for hierarchy checking
 */
export interface HierarchyUserInfo {
  id: number;
  bossId: number | null;
  companyId: number;
}

/**
 * Interface that services must implement to support hierarchy checking.
 * Each microservice should provide its own implementation using its Prisma client.
 */
export interface HierarchyService {
  /**
   * Finds user info by ID
   * @returns The user info or null if not found
   */
  findUserInfo: (userId: number) => Promise<HierarchyUserInfo | null>;

  /**
   * Checks if a manager is above the target user in the hierarchy.
   * Returns true if managerId is found walking up the chain from targetUserId.
   *
   * @param managerId - The ID of the potential manager
   * @param targetUserId - The ID of the user to check
   * @returns true if managerId is above targetUserId in the hierarchy
   */
  isAboveInHierarchy: (
    managerId: number,
    targetUserId: number,
  ) => Promise<boolean>;
}

/**
 * Base implementation of hierarchy checking logic.
 * Subclasses should implement findUserInfo using their specific Prisma client.
 */
export abstract class BaseHierarchyService implements HierarchyService {
  abstract findUserInfo(userId: number): Promise<HierarchyUserInfo | null>;

  /**
   * Default implementation that walks up the boss chain from targetUserId
   * to check if managerId is an ancestor.
   * Includes cycle detection to prevent infinite loops.
   */
  async isAboveInHierarchy(
    managerId: number,
    targetUserId: number,
  ): Promise<boolean> {
    const visited = new Set<number>();
    let currentId: number | null = targetUserId;

    while (currentId != null) {
      // Prevent infinite loop in case of circular references
      if (visited.has(currentId)) {
        return false;
      }
      visited.add(currentId);

      const user = await this.findUserInfo(currentId);
      if (user == null) {
        return false;
      }

      // Check if the boss is the manager we're looking for
      if (user.bossId === managerId) {
        return true;
      }

      currentId = user.bossId;
    }

    return false;
  }
}
