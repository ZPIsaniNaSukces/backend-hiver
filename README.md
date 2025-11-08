# Backend Hiver

Backend Hiver is a multi-service NestJS workspace that exposes an HTTP API gateway and Kafka-powered feature services. The implementation uses Prisma for data access with **separate databases for each microservice** and ships with an authentication library (`libs/auth`) that can be reused across applications inside this monorepo.

## Stack

- Node.js 22+
- NestJS 11 (monorepo layout)
- PostgreSQL + Prisma ORM (separate database per microservice)
- Apache Kafka (Kafkajs client)
- JWT authentication with Passport

## Architecture

This project follows microservices best practices with **database-per-service** pattern:

- **Users Microservice** → `hiver_users` database
- **Presence Microservice** → `hiver_presence` database

Each service has its own Prisma schema and generated client for complete data isolation.

📖 **For detailed database setup and architecture, see [docs/DATABASE_SETUP.md](docs/DATABASE_SETUP.md)**

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start infrastructure services (PostgreSQL, Kafka, Zookeeper):

   ```bash
   docker-compose up -d
   ```

   The PostgreSQL container will automatically create both databases (`hiver_users` and `hiver_presence`).

3. Configure environment variables:

   Copy the example file and update with your configuration:

   ```bash
   cp .env.example .env
   ```

   Required environment variables:

   ```bash
   # Database URLs - separate for each microservice
   DATABASE_URL="postgresql://postgres:password@localhost:5432/hiver_users"
   PRESENCE_DATABASE_URL="postgresql://postgres:password@localhost:5432/hiver_presence"

   # JWT Configuration
   JWT_SECRET="change-me"
   JWT_EXPIRES_IN="1h"

   # Kafka
   KAFKA_BROKER="localhost:9092"
   ```

4. Generate Prisma clients for all microservices:

   ```bash
   npm run prisma:generate
   ```

   Or generate individually:

   ```bash
   npm run prisma:generate:users
   npm run prisma:generate:presence
   ```

5. Run database migrations:

   ```bash
   npm run prisma:migrate:users
   npm run prisma:migrate:presence
   ```

6. Run the microservices:

   ```bash
   # Users service (Kafka microservice)
   npm run start:dev -- users

   # Presence service (Kafka microservice)
   npm run start:dev -- presence
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

This project uses **separate databases for each microservice**:

- **Users**: `prisma/users/schema.prisma` → `hiver_users` database
- **Presence**: `prisma/presence/schema.prisma` → `hiver_presence` database

### Common Operations

**Generate Prisma clients:**

```bash
# Generate all clients
npm run prisma:generate

# Generate specific client
npm run prisma:generate:users
npm run prisma:generate:presence
```

**Run migrations:**

```bash
# Create and apply migrations
npm run prisma:migrate:users
npm run prisma:migrate:presence
```

**Open Prisma Studio:**

```bash
# View users database
npm run prisma:studio:users

# View presence database
npm run prisma:studio:presence
```

**Deploy migrations (production):**

```bash
npm run prisma:migrate:deploy:users
npm run prisma:migrate:deploy:presence
```

📖 **For complete database documentation, see:**

- [Database Setup Guide](docs/DATABASE_SETUP.md)
- [Migration Guide](docs/MIGRATION_GUIDE.md)

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

### Development

- `npm run start:dev users` – start the users Kafka microservice with live reload
- `npm run start:dev presence` – start the presence Kafka microservice with live reload

### Code Quality

- `npm run lint` – ESLint with auto-fix rules
- `npm run typecheck` – project-wide TypeScript validation
- `npm run format` – format code with Prettier

### Database (Prisma)

- `npm run prisma:generate` – generate all Prisma clients
- `npm run prisma:generate:users` – generate users client only
- `npm run prisma:generate:presence` – generate presence client only
- `npm run prisma:migrate:users` – create and apply users migrations
- `npm run prisma:migrate:presence` – create and apply presence migrations
- `npm run prisma:studio:users` – open Prisma Studio for users database
- `npm run prisma:studio:presence` – open Prisma Studio for presence database

### Testing

- `npm run test` – run all Jest test suites
- `npm run test:cov` – collect coverage
- `npm run test:watch` – run tests in watch mode

## Contributing

1. Create a feature branch.
2. Update or add tests (the auth library includes reference unit tests).
3. Run `npm run lint` and `npm run typecheck` before committing.

Happy coding!
