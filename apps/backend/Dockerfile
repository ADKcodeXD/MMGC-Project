FROM node:22-alpine

WORKDIR /app

RUN npm install -g pm2

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV=prod

EXPOSE 8055

CMD ["pm2-runtime", "ecosystem.config.js", "--env", "production"]
