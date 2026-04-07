# ---- Base ----
FROM node:20-slim AS base
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# ---- Builder: install all deps, generate Prisma client, build API ----
FROM base AS builder
WORKDIR /app

# Copy workspace config first for dependency layer caching
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/api/package.json apps/api/nest-cli.json apps/api/tsconfig.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/

RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/database/ ./packages/database/
COPY packages/shared/ ./packages/shared/
COPY apps/api/src/ ./apps/api/src/

# Generate Prisma client and build API
RUN pnpm --filter @food-finder/database db:generate
RUN pnpm --filter @food-finder/api build

# ---- Production ----
FROM base
WORKDIR /app
ENV NODE_ENV=production

# Copy workspace config for pnpm install
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/

# Copy Prisma schema (needed for prisma generate)
COPY packages/database/prisma/schema.prisma ./packages/database/prisma/schema.prisma

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Generate Prisma client for production runtime
RUN npx prisma@6 generate --schema=./packages/database/prisma/schema.prisma

# Copy built API from builder
COPY --from=builder /app/apps/api/dist ./apps/api/dist

USER node
EXPOSE 3001
CMD ["node", "apps/api/dist/main"]
