FROM node:22-alpine AS deps

WORKDIR /repo/client

COPY client/package.json client/package-lock.json ./

RUN npm ci --no-audit --no-fund

FROM node:22-alpine AS builder

WORKDIR /repo

COPY --from=deps /repo/client/node_modules ./client/node_modules

COPY package.json package-lock.json ./
COPY client ./client

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build --prefix client

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

ENV API_BASE=https://phimapi.com

RUN chown node:node /app

COPY --from=builder --chown=node:node /repo/client/.next/standalone ./
COPY --from=builder --chown=node:node /repo/client/.next/static ./client/.next/static
COPY --from=builder --chown=node:node /repo/client/public ./client/public

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/robots.txt').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "client/server.js"]
