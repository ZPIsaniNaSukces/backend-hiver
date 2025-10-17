# Backend Hiver

Backend Hiver is a multi-service NestJS workspace that exposes an HTTP API gateway and Kafka-powered feature services. The implementation uses Prisma for data access and ships with an authentication library (`libs/auth`) that can be reused across applications inside this monorepo.

## Stack

- Node.js 22+
- NestJS 11 (monorepo layout)
- PostgreSQL + Prisma ORM
- Apache Kafka (Kafkajs client)
- JWT authentication with Passport

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start infrastructure services (PostgreSQL, Kafka, Zookeeper):
   ```bash
   docker compose up -d
   ```
3. Configure environment variables (see [.env.example](.env.example)) and create a `.env` file. At minimum set:
   ```bash
   DATABASE_URL="postgresql://postgres:password@localhost:5432/hiver"
   JWT_SECRET="change-me"
   JWT_EXPIRES_IN="1h"
   ```
4. Generate the Prisma client (required after every schema change):
   ```bash
   npx prisma generate
   ```
5. Run the microservices:

   ```bash
   # API Gateway (HTTP)
   npm run start:dev -- api-gateway

   # Users service (Kafka microservice)
   npm run start:dev -- users
   ```

## Authentication

The `libs/auth` package centralises JWT-based authentication, role enforcement, and request decorators. Import everything via the path alias `@app/auth`.

### Environment variables

- `JWT_SECRET` – symmetric signing key used by the JWT module. Provide a long, random value in production.
- `JWT_EXPIRES_IN` – token lifetime passed to `JwtService.signAsync` (examples: `1h`, `15m`).

### REST endpoints

The API gateway exposes two authentication endpoints via `AuthController`:

| Method | Path          | Description                                                      |
| ------ | ------------- | ---------------------------------------------------------------- |
| POST   | `/auth/login` | Validates credentials and returns a JWT + user payload.          |
| GET    | `/auth/me`    | Requires a bearer token; returns the authenticated user profile. |

`POST /auth/login` expects:

```json
{
  "email": "user@example.com",
  "password": "plainText"
}
```

Successful responses look like:

```json
{
  "accessToken": "<jwt>",
  "user": {
    "id": 1,
    "name": "Jane",
    "surname": "Doe",
    "email": "user@example.com",
    "role": "ADMIN",
    "phone": null,
    "teamId": 2,
    "companyId": 3
  }
}
```

Include the token in subsequent requests: `Authorization: Bearer <jwt>`.

### Guards, decorators, and helpers

All items below are exported from `@app/auth`:

- `JwtAuthGuard` – wraps Passport's `AuthGuard("jwt")`; protects HTTP routes.
- `RolesGuard` – enforces roles declared with the `@Roles(...roles)` decorator.
- `@Roles(...roles)` – attach one or more `USER_ROLE` values to a handler or controller.
- `@CurrentUser(property?)` – access the authenticated `AuthenticatedUser` instance (or a single property) from the request.

Example usage inside a controller:

```ts
import { CurrentUser, JwtAuthGuard, Roles } from "@app/auth";
import { USER_ROLE } from "@prisma/client";

import { Controller, Get, UseGuards } from "@nestjs/common";

@Controller("reports")
@UseGuards(JwtAuthGuard)
export class ReportsController {
  @Get("admin")
  @Roles(USER_ROLE.ADMIN)
  getAdminReport(@CurrentUser("id") adminId: number) {
    return { adminId };
  }
}
```

### Password handling

The users service hashes passwords with `bcrypt` when creating or updating accounts. The Prisma schema enforces unique user emails to support credential lookups. Existing plaintext passwords should be re-seeded with hashed values before deploying to production.

### Roles

Authentication leverages the `USER_ROLE` enum defined in `prisma/schema.prisma`:

- `ADMIN`
- `MANAGER`
- `EMPLOYEE`

Use these values with the `@Roles` decorator and `RolesGuard` to lock down endpoints.

## Database and Prisma

- Inspect or edit the schema in `prisma/schema.prisma`.
- After modifying the schema run migrations, e.g.:
  ```bash
  npx prisma migrate dev --name add-user-email-unique
  ```
- Update the generated client whenever the schema changes:
  ```bash
  npx prisma generate
  ```

## Testing

Run all Jest suites:

```bash
npm run test
```

Key tests:

- `libs/auth/src/auth.service.spec.ts` verifies credential validation, JWT issuance, and sanitised responses.
- `libs/auth/src/guards/roles.guard.spec.ts` covers role-based access behaviour.

Collect coverage with:

```bash
npm run test:cov
```

## Useful scripts

- `npm run lint` – ESLint with auto-fix rules.
- `npm run typecheck` – project-wide TypeScript validation.
- `npm run start:dev users` – start the users Kafka microservice.
- `npm run start:dev api-gateway` – start the HTTP gateway with live reload.

## Contributing

1. Create a feature branch.
2. Update or add tests (the auth library includes reference unit tests).
3. Run `npm run lint` and `npm run typecheck` before committing.

Happy coding!
