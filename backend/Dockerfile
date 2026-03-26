FROM node:22-alpine

# 1. Install necessary libraries for Prisma Engine on Alpine
# libc6-compat is for the engine, openssl for the connection
RUN apk add --no-cache openssl libc6-compat libcrypto3

WORKDIR /app

COPY package*.json ./

# 2. Install dependencies (using ci for cleaner docker builds)
RUN npm ci

COPY . .

# 3. CRITICAL: Ensure Prisma knows it's on Alpine during generation
ENV PRISMA_CLI_BINARY_TARGET=linux-musl-openssl-3.0.x
RUN npx prisma generate

RUN npm run build

EXPOSE 3001

# 4. We keep the CMD simple; we'll handle migrations in docker-compose
CMD ["npm", "start"]