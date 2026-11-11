# syntax=docker/dockerfile:1
# Build context: services/mercur-marketplace
# Railway Root Directory must be services/mercur-marketplace.
# MERCUR_BACKEND_URL is required at image build time (panels bake the API origin).

FROM node:22-bookworm-slim AS deps
WORKDIR /app
RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
  && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY apps/admin/package.json apps/admin/package.json
COPY apps/vendor/package.json apps/vendor/package.json
COPY packages/api/package.json packages/api/package.json
RUN npm ci

FROM deps AS build
COPY . .
ARG MERCUR_BACKEND_URL
ENV MERCUR_BACKEND_URL=${MERCUR_BACKEND_URL}
ENV NODE_ENV=production
ENV TURBO_UI=stream
ENV CI=true
RUN test -n "$MERCUR_BACKEND_URL" || (echo "MERCUR_BACKEND_URL build-arg is required" && exit 1)
RUN npm run build \
  && mkdir -p /opt/server \
  && cp -a packages/api/.medusa/server/. /opt/server/ \
  && cd /opt/server \
  && npm install --omit=dev

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=9000
ENV MEDUSA_WORKER_MODE=shared
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 medusa \
  && useradd --system --uid 1001 --gid medusa --home-dir /app medusa
COPY --from=build --chown=medusa:medusa /opt/server /app/.medusa/server
COPY --chown=medusa:medusa docker /docker
RUN chmod +x /docker/*.sh \
  && mkdir -p /app/.medusa/server/static \
  && chown medusa:medusa /app/.medusa/server/static
USER medusa
EXPOSE 9000
CMD ["/docker/start.sh"]
