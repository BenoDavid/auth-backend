FROM node:22-bookworm-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY config ./config
COPY migrations ./migrations
COPY seeders ./seeders
COPY scripts ./scripts
COPY src ./src
COPY .sequelizerc ./

ENV NODE_ENV=production
EXPOSE 8082

CMD ["node", "src/server.js"]
