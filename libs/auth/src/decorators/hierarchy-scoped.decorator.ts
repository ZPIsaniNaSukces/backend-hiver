import { SetMetadata } from "@nestjs/common";

export const HIERARCHY_SCOPED_KEY = Symbol("HIERARCHY_SCOPED_METADATA");

export type HierarchyScopedSource = "body" | "params" | "query";

export interface HierarchyScopedOptions {
  /**
   * Where to find the target user ID in the request
   */
  source?: HierarchyScopedSource;
  /**
   * The property path to the target user ID (supports nested paths like "data.userId")
   */
  propertyPath?: string;
  /**
   * If true, allows users to modify themselves without hierarchy check
   * @default true
   */
  allowSelf?: boolean;
  /**
   * If true, allows the operation when target user ID is not provided (undefined/null)
   * Useful for optional fields like assigneeId
   * @default false
   */
  allowMissing?: boolean;
}

export const HierarchyScoped = (options?: HierarchyScopedOptions) =>
  SetMetadata(
    HIERARCHY_SCOPED_KEY,
    options ?? ({} satisfies HierarchyScopedOptions),
  );
