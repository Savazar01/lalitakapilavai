# Multi-stage Dockerfile for Next.js 16 (Debian 12 Bookworm Slim)
# Full glibc binary compatibility for Sharp (libvips), Prisma query engines, and native add-ons

FROM node:22-bookworm-slim AS base
WORKDIR /app

# Stage 1: Install dependencies
FROM base AS deps
RUN apt-get update && \
    apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

# Development stage for local multi-container live-reloading (inherits deps)
FROM deps AS dev
WORKDIR /app
COPY prisma ./prisma
RUN if [ -f "./prisma/schema.prisma" ]; then npx prisma generate; fi

ENV NODE_ENV=development
ENV PORT=3060
ENV HOSTNAME="0.0.0.0"

EXPOSE 3060

CMD ["npm", "run", "dev"]

# Stage 2: Build the application
FROM base AS builder
RUN apt-get update && \
    apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client with glibc engine
RUN if [ -f "./prisma/schema.prisma" ]; then npx prisma generate; fi

# Next.js telemetry disabled during build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# Stage 3: Minimal production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3060
ENV HOSTNAME="0.0.0.0"

# Install runtime SSL dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends openssl ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Security: Run as non-root user via Debian shadow-utils
RUN groupadd --system --gid 1001 nodejs && \
    useradd --system --uid 1001 nextjs

# Copy Prisma schema for runtime migrations or client access
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Copy public static assets
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Setup prerender cache directory permissions
RUN mkdir -p .next && chown -R nextjs:nodejs .next

# Copy standalone build output and static bundles
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma CLI and tsx runtime dependencies from deps for automated entrypoint lifecycle
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/prisma ./node_modules/prisma
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/tsx ./node_modules/tsx
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/esbuild ./node_modules/esbuild
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/@esbuild ./node_modules/@esbuild
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/get-tsconfig ./node_modules/get-tsconfig
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/.bin ./node_modules/.bin

# Copy automated container lifecycle entrypoint hook
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Enforce non-root ownership across application directory
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3060

ENTRYPOINT ["/app/docker-entrypoint.sh"]
