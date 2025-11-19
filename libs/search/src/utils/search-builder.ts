/**
 * Build a Prisma where clause for searching across multiple fields
 * @param searchTerm - The search term
 * @param fields - Array of field names to search in
 * @returns Prisma where clause with OR conditions
 */
export function buildSearchWhere(
  searchTerm: string | undefined,
  fields: string[],
): Record<string, unknown> | undefined {
  if (searchTerm === undefined || searchTerm.trim() === "") {
    return undefined;
  }

  const trimmedSearch = searchTerm.trim();

  return {
    OR: fields.map((field) => ({
      [field]: {
        contains: trimmedSearch,
        mode: "insensitive",
      },
    })),
  };
}

/**
 * Combine search and other filters
 * @param searchWhere - Search where clause from buildSearchWhere
 * @param additionalFilters - Additional where conditions
 * @returns Combined where clause
 */
export function combineFilters(
  searchWhere: Record<string, unknown> | undefined,
  additionalFilters: Record<string, unknown> = {},
): Record<string, unknown> {
  if (searchWhere === undefined) {
    return additionalFilters;
  }

  if (Object.keys(additionalFilters).length === 0) {
    return searchWhere;
  }

  return {
    AND: [searchWhere, additionalFilters],
  };
}
