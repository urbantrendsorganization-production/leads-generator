FROM node:22-alpine

# 1. Install necessary libraries for Prisma Engine on Alpine
RUN apk add --no-cache openssl libc6-compat libcrypto3

WORKDIR /app

# 2. Prevent local .env from interfering with the build
# This ensures Prisma doesn't pick up a 'localhost' URL from your machine
ENV DATABASE_URL="postgresql://trendyyleads:trendyyleads_dev@postgres:5432/trendyyleads"
ENV NODE_ENV=production

COPY package*.json ./

# 3. Install dependencies
RUN npm ci

COPY . .

# 4. Remove any existing generated client to force a fresh build
RUN rm -rf ./node_modules/.prisma ./node_modules/@prisma/client

# 5. Generate Prisma client for the Alpine (musl) environment
ENV PRISMA_CLI_BINARY_TARGET=linux-musl-openssl-3.0.x
RUN npx prisma generate

# 6. Build the TypeScript source
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]