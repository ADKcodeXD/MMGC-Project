# Build stage
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

# Copy workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json apps/frontend/

# Install dependencies
RUN pnpm install --filter mirai-offcial-website --frozen-lockfile

# Copy frontend source
COPY apps/frontend/ apps/frontend/

WORKDIR /app/apps/frontend

# Use the existing build script (includes popperjs compatibility fix)
RUN pnpm run build

# Run stage
FROM node:22-alpine

WORKDIR /app

COPY --from=builder /app/apps/frontend/.output /app/.output

RUN mkdir -p env

EXPOSE 3000

CMD ["sh", "-c", "set -a && . ./env/.env.production && set +a && node .output/server/index.mjs"]
