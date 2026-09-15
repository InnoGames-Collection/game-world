# Multi-Stage Production Dockerfile for GAMEON TELE Backend
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json tsconfig.json ./
RUN npm ci

COPY src/ ./src/
RUN npm run build

# Stage 2: Production Runtime
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8200
ENV HOST=0.0.0.0

# Install dumb-init for proper PID 1 signal forwarding
RUN apk add --no-cache dumb-init

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY db/ ./db/

# Run as non-root user for Tier-0 security
USER node

EXPOSE 8200

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
