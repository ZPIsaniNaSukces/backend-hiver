# base stage
FROM node:20-alpine AS base

# development stage
FROM base AS development
ARG APP
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci
COPY prisma ./prisma
COPY generated ./generated
COPY . .

# Generate Prisma clients for all schemas
RUN npx prisma generate --schema=prisma/users/schema.prisma
RUN npx prisma generate --schema=prisma/presence/schema.prisma
RUN npx prisma generate --schema=prisma/leave-requests/schema.prisma
RUN npx prisma generate --schema=prisma/tasks/schema.prisma

RUN npm run build ${APP}
RUN npm prune --omit=dev


# production stage
FROM base AS production
ARG APP
ARG NODE_ENV=production
WORKDIR /usr/src/app
ENV NODE_ENV=${NODE_ENV}
ENV APP_NAME=${APP}
ENV APP_MAIN_FILE=dist/apps/${APP_NAME}/main
ENV PRISMA_SCHEMA_FILE=prisma/${APP_NAME}/schema.prisma
ENV PRISMA_SEED_FILE=prisma/${APP_NAME}/seed.ts
COPY --from=development /usr/src/app/node_modules ./node_modules
COPY --from=development /usr/src/app/prisma ./prisma
COPY --from=development /usr/src/app/generated ./generated
COPY --from=development /usr/src/app/dist ./dist

# Run migrations for the selected service, optionally seed, then boot the Nest app
CMD ["sh", "-c", "npx prisma db push --skip-generate --accept-data-loss --schema=$PRISMA_SCHEMA_FILE && if [ -f \"$PRISMA_SEED_FILE\" ]; then npx --yes tsx \"$PRISMA_SEED_FILE\"; fi && node $APP_MAIN_FILE"]