FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile 2>/dev/null || bun install

# Build — inject NEXT_PUBLIC_* at build time via .env.local
FROM base AS builder
ARG NEXT_PUBLIC_CONVEX_URL
ARG NEXT_PUBLIC_CONVEX_SITE_URL
ARG CONVEX_DEPLOYMENT
ARG RESEND_API_KEY
ARG AUTH_SECRET

# Create .env.local for Next.js build (NEXT_PUBLIC_* must be in .env at build time)
RUN printf "NEXT_PUBLIC_CONVEX_URL=%s\nNEXT_PUBLIC_CONVEX_SITE_URL=%s\nCONVEX_DEPLOYMENT=%s\nRESEND_API_KEY=%s\nAUTH_SECRET=%s\n" \
  "$NEXT_PUBLIC_CONVEX_URL" "$NEXT_PUBLIC_CONVEX_SITE_URL" "$CONVEX_DEPLOYMENT" "$RESEND_API_KEY" "$AUTH_SECRET" > .env.local

COPY --from=deps /app/node_modules ./node_modules
COPY . .
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
