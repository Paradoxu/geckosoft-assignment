FROM node:20-alpine AS base

ENV PNPM_HOME /root/pnpm

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
RUN npm i -g pnpm

RUN mkdir -p /app
WORKDIR /app

# Change the owner of the app directory
RUN chown -R node:node /app


FROM base AS builder

COPY ./tsconfig*.json ./
COPY ./nest-cli.json ./

COPY ./pnpm-lock.yaml ./
COPY ./package.json ./
RUN pnpm install

COPY ./src src
RUN pnpm run build


# Creates an image for production
FROM base

ENV NODE_ENV production

# Create a storage folder for uploaded files, ideally this should me a mounted folder from the host
RUN mkdir -p /app/storage

COPY --chown=node:node --from=builder /app/pnpm-lock.yaml ./

# Optimize install time copying pnpm root modules from the builder step
COPY --chown=node:node --from=builder ${PNPM_HOME} ${PNPM_HOME}
RUN pnpm fetch --prod

COPY --chown=node:node  --from=builder /app/package.json ./
RUN pnpm install -r --offline --prod

# Bundle app source
COPY --chown=node:node --from=builder /app/dist ./dist

USER node
EXPOSE 3000

CMD ["pnpm", "run", "start:prod"]