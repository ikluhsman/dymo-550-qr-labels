# ---------- Build frontend ----------
FROM node:20-slim AS client-build

WORKDIR /app/client

# Install pnpm
RUN corepack enable

COPY client/package*.json ./
RUN pnpm install

COPY client .
RUN pnpm build


# ---------- Runtime ----------
FROM node:20-slim

WORKDIR /app

# Install backend deps
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --omit=dev

# Copy backend code
COPY server ./

# Copy built frontend into /public
COPY --from=client-build /app/client/dist ./public

# Create data directory
RUN mkdir -p /data

ENV NODE_ENV=production
ENV DB_PATH=/data/labels.db

EXPOSE 4000

CMD ["node", "server.js"]
