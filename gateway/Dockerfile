FROM oven/bun:1 AS base

WORKDIR /app

COPY package.json ./
COPY bun.lockb* ./
RUN bun install --frozen-lockfile || bun install

COPY . .

ENV NODE_ENV=production
ENV AIPLATFORM_GATEWAY_CONFIG=/app/config.test.local.yaml
ENV PORT=8080

EXPOSE 8080

CMD ["bun", "run", "src/index.ts"]
