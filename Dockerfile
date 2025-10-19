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
COPY . .
RUN npx prisma generate
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
COPY --from=development /usr/src/app/dist ./dist

# defaults to compiled Nest entry file for the selected app
ENV APP_MAIN_FILE=dist/apps/${APP_NAME}/main
CMD sh -c "npx prisma db push --skip-generate && npx tsx prisma/seed.ts && node $APP_MAIN_FILE"