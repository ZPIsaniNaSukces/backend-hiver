# Pagination Library

A reusable pagination library for NestJS applications that can be easily attached to any GET endpoint.

## Features

- ✅ Type-safe pagination with TypeScript
- ✅ Input validation with class-validator
- ✅ Configurable page size limits
- ✅ Rich metadata (total count, pages, navigation flags)
- ✅ Easy to integrate with Prisma
- ✅ Works with any data type

## Installation

The library is already configured in this monorepo. Simply import it:

```typescript
import {
  PaginatedResponse,
  PaginationQueryDto,
  createPaginatedResponse,
  getPaginationParameters,
} from "@app/pagination";
```

## Usage

### 1. In Your Controller

Add the `PaginationQueryDto` to your GET endpoint:

```typescript
import { PaginationQueryDto } from "@app/pagination";

import { Controller, Get, Query } from "@nestjs/common";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Query() paginationQuery: PaginationQueryDto) {
    return await this.usersService.findAll(paginationQuery);
  }
}
```

### 2. In Your Service

Use the pagination utilities to paginate your database queries:

```typescript
import type { PaginatedResponse, PaginationQueryDto } from "@app/pagination";
import { createPaginatedResponse, getPaginationParameters } from "@app/pagination";

async findAll(paginationQuery: PaginationQueryDto): Promise<PaginatedResponse<User>> {
  const page = paginationQuery.page ?? 1;
  const limit = paginationQuery.limit ?? 10;
  const { skip, take } = getPaginationParameters(page, limit);

  const [users, total] = await Promise.all([
    this.prisma.user.findMany({
      skip,
      take,
    }),
    this.prisma.user.count(),
  ]);

  return createPaginatedResponse(users, total, page, limit);
}
```

## API Reference

### PaginationQueryDto

Query parameters for pagination:

- `page` (optional): Page number (default: 1, min: 1)
- `limit` (optional): Items per page (default: 10, min: 1, max: 100)

### PaginatedResponse<T>

Response structure:

```typescript
{
  data: T[];                // Array of items
  meta: {
    total: number;          // Total number of items
    page: number;           // Current page number
    limit: number;          // Items per page
    totalPages: number;     // Total number of pages
    hasNextPage: boolean;   // Whether there is a next page
    hasPreviousPage: boolean; // Whether there is a previous page
  }
}
```

### Utility Functions

#### `getPaginationParameters(page: number, limit: number)`

Converts page and limit to Prisma's skip/take format:

```typescript
const { skip, take } = getPaginationParameters(2, 10);
// Returns: { skip: 10, take: 10 }
```

#### `createPaginatedResponse<T>(data: T[], total: number, page: number, limit: number)`

Creates a paginated response with metadata:

```typescript
return createPaginatedResponse(users, 25, 1, 10);
```

## Example API Calls

### Get first page with default limit (10)

```bash
curl "http://localhost:8000/users?page=1" -H "Authorization: Bearer TOKEN"
```

### Get second page with 20 items

```bash
curl "http://localhost:8000/users?page=2&limit=20" -H "Authorization: Bearer TOKEN"
```

### Get first page (default parameters)

```bash
curl "http://localhost:8000/users" -H "Authorization: Bearer TOKEN"
```

## Validation

The library automatically validates:

- Page must be at least 1
- Limit must be between 1 and 100
- Both parameters must be integers

Invalid requests return a 400 Bad Request error with details.

## Example Response

```json
{
  "data": [
    {
      "id": 1,
      "name": "Alice",
      "email": "alice@example.com"
    },
    {
      "id": 2,
      "name": "Bob",
      "email": "bob@example.com"
    }
  ],
  "meta": {
    "total": 25,
    "page": 1,
    "limit": 2,
    "totalPages": 13,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```
