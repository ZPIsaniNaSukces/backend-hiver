# base stage
FROM node:20-alpine AS base

# development stage
FROM base AS development
ARG APP
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY prisma ./prisma   
COPY . .
RUN npx prisma generate
RUN npm run build ${APP}
RUN npm prune --omit=dev --exclude=nodemailer --exclude=@nestjs-modules/mailer


# production stage
FROM base AS production
ARG APP
ARG NODE_ENV=production
WORKDIR /usr/src/app
ENV NODE_ENV=${NODE_ENV}
ENV APP_NAME=${APP}
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=development /usr/src/app/prisma ./prisma
RUN npx prisma generate

COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/libs/mail/src/templates ./libs/mail/src/templates

#run migrations and start app
ENV APP_MAIN_FILE=dist/apps/${APP_NAME}/main
#use db push for dev (no migration files needed), migrate deploy for prod
CMD sh -c "npx prisma db push --skip-generate && node $APP_MAIN_FILE"