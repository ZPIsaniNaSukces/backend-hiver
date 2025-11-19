# Search Library

A reusable search library for NestJS applications that provides case-insensitive search across multiple fields. Works seamlessly with the pagination library.

## Features

- ✅ Case-insensitive search
- ✅ Search across multiple fields simultaneously
- ✅ Works with Prisma ORM
- ✅ Type-safe with TypeScript
- ✅ Input validation with class-validator
- ✅ Integrates seamlessly with pagination
- ✅ Flexible filter combination utilities

## Installation

The library is already configured in this monorepo. Simply import it:

```typescript
import { SearchQueryDto, buildSearchWhere, combineFilters } from "@app/search";
```

## Usage

### Option 1: Combined with Pagination (Recommended)

Use the `PaginatedSearchQueryDto` from the pagination library for endpoints that need both features:

```typescript
import { PaginatedSearchQueryDto } from "@app/pagination";

import { Controller, Get, Query } from "@nestjs/common";

@Controller("users")
export class UsersController {
  @Get()
  async findAll(@Query() query: PaginatedSearchQueryDto) {
    return await this.usersService.findAll(query);
  }
}
```

### Option 2: Search Only

For search-only endpoints, use `SearchQueryDto`:

```typescript
import { SearchQueryDto } from "@app/search";

import { Controller, Get, Query } from "@nestjs/common";

@Controller("users")
export class UsersController {
  @Get()
  async findAll(@Query() searchQuery: SearchQueryDto) {
    return await this.usersService.findAll(searchQuery);
  }
}
```

### Service Implementation

Use the `buildSearchWhere` utility to create Prisma where clauses:

```typescript
import { buildSearchWhere } from "@app/search";
import type { PaginatedSearchQueryDto } from "@app/pagination";
import { getPaginationParameters, createPaginatedResponse } from "@app/pagination";

async findAll(query: PaginatedSearchQueryDto) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const { skip, take } = getPaginationParameters(page, limit);

  // Specify which fields to search in
  const searchWhere = buildSearchWhere(query.search, [
    "name",
    "surname",
    "email",
  ]);

  const [users, total] = await Promise.all([
    this.prisma.user.findMany({
      where: searchWhere,
      skip,
      take,
    }),
    this.prisma.user.count({
      where: searchWhere,
    }),
  ]);

  return createPaginatedResponse(users, total, page, limit);
}
```

## API Reference

### SearchQueryDto

Query parameter for search:

- `search` (optional): Search term (min length: 1 character)

### buildSearchWhere<T>(searchTerm, fields)

Builds a Prisma where clause for searching across multiple fields.

**Parameters:**

- `searchTerm` (string | undefined): The search term from the query
- `fields` (Array<keyof T>): Array of field names to search in

**Returns:** `Record<string, unknown> | undefined`

**Example:**

```typescript
const searchWhere = buildSearchWhere(query.search, [
  "name",
  "email",
  "description",
]);
// Returns: { OR: [{ name: { contains: "term", mode: "insensitive" } }, ...] }
```

### combineFilters(searchWhere, additionalFilters)

Combines search filters with other filters using AND logic.

**Parameters:**

- `searchWhere` (Record<string, unknown> | undefined): Search where clause
- `additionalFilters` (Record<string, unknown>): Additional filter conditions

**Returns:** `Record<string, unknown>`

**Example:**

```typescript
const searchWhere = buildSearchWhere(query.search, ["name"]);
const filters = combineFilters(searchWhere, { isActive: true, companyId: 1 });
// Returns: { AND: [{ OR: [...] }, { isActive: true, companyId: 1 }] }
```

## Example API Calls

### Search by name

```bash
curl "http://localhost:8000/users?search=Alice" -H "Authorization: Bearer TOKEN"
```

### Search with pagination

```bash
curl "http://localhost:8000/users?search=admin&page=1&limit=5" -H "Authorization: Bearer TOKEN"
```

### Partial search (case-insensitive)

```bash
curl "http://localhost:8000/users?search=mar" -H "Authorization: Bearer TOKEN"
# Matches "Martin", "Mary", "Marvin", etc.
```

## How It Works

The search library uses Prisma's `contains` filter with `mode: "insensitive"` to perform case-insensitive partial matching across specified fields using OR logic.

For example, searching for "Alice" across `name`, `surname`, and `email` fields generates:

```sql
WHERE (
  name ILIKE '%Alice%' OR
  surname ILIKE '%Alice%' OR
  email ILIKE '%Alice%'
)
```

## Validation

The library automatically validates:

- Search term must be at least 1 character (if provided)
- Empty searches are treated as no filter (returns all results)

## Integration with Other Features

### With Pagination

```bash
GET /users?search=admin&page=1&limit=10
```

### With Additional Filters

```typescript
const searchWhere = buildSearchWhere(query.search, ["name", "email"]);
const filters = combineFilters(searchWhere, {
  companyId: user.companyId,
  isActive: true,
});

await this.prisma.user.findMany({ where: filters });
```

## Example Response

```json
{
  "data": [
    {
      "id": 1,
      "name": "Alice",
      "surname": "Admin",
      "email": "alice.admin@acme.com"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPreviousPage": false
  }
}
```

## Best Practices

1. **Choose relevant fields**: Only include fields that make sense for search (avoid IDs, dates, etc.)
2. **Consider performance**: Searching many fields or large text fields can impact performance
3. **Add database indexes**: Create indexes on frequently searched columns
4. **Combine with pagination**: Always use pagination for endpoints that might return many results
5. **Limit search scope**: Consider adding additional filters to narrow down results

## Adding to Other Endpoints

To add search to any endpoint:

1. **Import the combined DTO:**

   ```typescript
   import { PaginatedSearchQueryDto } from "@app/pagination";
   ```

2. **Update your controller:**

   ```typescript
   @Get()
   async findAll(@Query() query: PaginatedSearchQueryDto) {
     return await this.service.findAll(query);
   }
   ```

3. **Update your service:**

   ```typescript
   import { buildSearchWhere } from "@app/search";

   async findAll(query: PaginatedSearchQueryDto) {
     const searchWhere = buildSearchWhere(query.search, [
       "field1",
       "field2",
       "field3"
     ]);

     return await this.prisma.model.findMany({
       where: searchWhere,
       // ... pagination, ordering, etc.
     });
   }
   ```

## Performance Considerations

- PostgreSQL `ILIKE` is used for case-insensitive search
- Consider using full-text search for better performance on large datasets
- Add appropriate indexes on searchable columns
- For very large datasets, consider implementing search debouncing on the client side

## Benefits

✅ **Easy to use**: Simple API that works with existing Prisma queries  
✅ **Flexible**: Search any combination of fields  
✅ **Type-safe**: Full TypeScript support  
✅ **Validated**: Automatic input validation  
✅ **Case-insensitive**: Works naturally for user searches  
✅ **Composable**: Easily combine with other filters  
✅ **Production-ready**: Tested and deployed
