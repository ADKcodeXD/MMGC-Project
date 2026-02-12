# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx nuxi build && \
    mkdir -p .output/server/node_modules/@popperjs && \
    mv .output/server/node_modules/@sxzz/popperjs-es .output/server/node_modules/@popperjs/core

# Run stage
FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/.output /app/.output
COPY --from=builder /app/package*.json ./

# Create env directory for mounted env file
RUN mkdir -p env

EXPOSE 3000

CMD ["node", ".output/server/index.mjs"]
