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

RUN npm run build ${APP}
RUN npm prune --omit=dev


# production stage
FROM base AS production
ARG APP
ARG NODE_ENV=production
WORKDIR /usr/src/app
ENV NODE_ENV=${NODE_ENV}
ENV APP_NAME=${APP}
COPY --from=development /usr/src/app/node_modules ./node_modules
COPY --from=development /usr/src/app/prisma ./prisma
COPY --from=development /usr/src/app/generated ./generated
COPY --from=development /usr/src/app/dist ./dist

# Run migrations for the specific service's database on startup
# Users service: uses DATABASE_URL -> hiver_users
# Presence service: uses PRESENCE_DATABASE_URL -> hiver_presence
CMD sh -c "if [ \"$APP_NAME\" = \"users\" ]; then \
      npx prisma db push --schema=prisma/users/schema.prisma --skip-generate --accept-data-loss; \
    elif [ \"$APP_NAME\" = \"presence\" ]; then \
      npx prisma db push --schema=prisma/presence/schema.prisma --skip-generate --accept-data-loss; \
    fi && node dist/apps/$APP_NAME/main"