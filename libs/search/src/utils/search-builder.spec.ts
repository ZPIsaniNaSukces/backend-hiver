import { buildSearchWhere, combineFilters } from "./search-builder";

describe("SearchBuilder", () => {
  describe("buildSearchWhere", () => {
    it("should return undefined if searchTerm is undefined", () => {
      const result = buildSearchWhere(undefined, ["name"]);
      expect(result).toBeUndefined();
    });

    it("should return undefined if searchTerm is empty string", () => {
      const result = buildSearchWhere("", ["name"]);
      expect(result).toBeUndefined();
    });

    it("should return undefined if searchTerm is only whitespace", () => {
      const result = buildSearchWhere("   ", ["name"]);
      expect(result).toBeUndefined();
    });

    it("should build a valid Prisma where clause for a single field", () => {
      const result = buildSearchWhere("test", ["name"]);
      expect(result).toEqual({
        OR: [
          {
            name: {
              contains: "test",
              mode: "insensitive",
            },
          },
        ],
      });
    });

    it("should build a valid Prisma where clause for multiple fields", () => {
      const result = buildSearchWhere("test", ["name", "email"]);
      expect(result).toEqual({
        OR: [
          {
            name: {
              contains: "test",
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: "test",
              mode: "insensitive",
            },
          },
        ],
      });
    });

    it("should trim the search term", () => {
      const result = buildSearchWhere("  test  ", ["name"]);
      expect(result).toEqual({
        OR: [
          {
            name: {
              contains: "test",
              mode: "insensitive",
            },
          },
        ],
      });
    });
  });

  describe("combineFilters", () => {
    it("should return additionalFilters if searchWhere is undefined", () => {
      const additionalFilters = { active: true };
      const result = combineFilters(undefined, additionalFilters);
      expect(result).toBe(additionalFilters);
    });

    it("should return searchWhere if additionalFilters is empty", () => {
      const searchWhere = { OR: [] };
      const result = combineFilters(searchWhere, {});
      expect(result).toBe(searchWhere);
    });

    it("should combine searchWhere and additionalFilters with AND", () => {
      const searchWhere = { OR: [{ name: { contains: "test" } }] };
      const additionalFilters = { active: true };
      const result = combineFilters(searchWhere, additionalFilters);
      expect(result).toEqual({
        AND: [searchWhere, additionalFilters],
      });
    });
  });
});
