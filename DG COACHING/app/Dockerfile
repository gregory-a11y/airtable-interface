FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile 2>/dev/null || bun install

# Build
FROM base AS builder
ARG NEXT_PUBLIC_CONVEX_URL
ARG NEXT_PUBLIC_CONVEX_SITE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create .env.local AFTER copy so it's not overwritten
RUN echo "NEXT_PUBLIC_CONVEX_URL=${NEXT_PUBLIC_CONVEX_URL}" > .env.local && \
    echo "NEXT_PUBLIC_CONVEX_SITE_URL=${NEXT_PUBLIC_CONVEX_SITE_URL}" >> .env.local && \
    cat .env.local

RUN bun run build

# Production
FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["bun", "server.js"]
