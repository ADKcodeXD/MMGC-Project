FROM node:22-alpine

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
RUN npm install -g pm2

WORKDIR /app

# Copy workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json apps/backend/

# Install dependencies
RUN pnpm install --filter mmgc_backend --frozen-lockfile

# Copy backend source
COPY apps/backend/ apps/backend/

WORKDIR /app/apps/backend

ENV NODE_ENV=prod

EXPOSE 8055

CMD ["pm2-runtime", "ecosystem.config.js", "--env", "production"]
