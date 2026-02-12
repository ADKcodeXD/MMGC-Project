FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

# Copy workspace config
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/MMGCBACK/package.json apps/MMGCBACK/

# Install dependencies
RUN pnpm install --filter @mmgc/admin --frozen-lockfile

# Copy admin source
COPY apps/MMGCBACK/ apps/MMGCBACK/

WORKDIR /app/apps/MMGCBACK

RUN npx cross-env NODE_ENV=production npx vite build

# Serve with nginx
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

RUN echo 'server { \
    listen 80; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

COPY --from=builder /app/apps/MMGCBACK/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
