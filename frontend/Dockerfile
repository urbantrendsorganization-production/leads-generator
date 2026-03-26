FROM node:22-alpine

# 1. Install necessary libraries
RUN apk add --no-cache openssl libc6-compat libcrypto3

WORKDIR /app

# 2. Environment Setup for Build
# We stay in development mode initially so npm install includes tsc
ENV NODE_ENV=development
ENV DATABASE_URL="postgresql://trendyyleads:trendyyleads_dev@postgres:5432/trendyyleads"

COPY package*.json ./

# 3. Install ALL dependencies
RUN npm install

COPY . .

# 4. Cleanup and Generate Prisma
RUN rm -rf ./node_modules/.prisma ./node_modules/@prisma/client
ENV PRISMA_CLI_BINARY_TARGET=linux-musl-openssl-3.0.x
RUN npx prisma generate

# 5. Build the TypeScript source
# We use 'npx' to ensure it finds the local 'tsc' binary
RUN npx tsc

EXPOSE 3001

# 6. Final Production Env
ENV NODE_ENV=production

CMD ["npm", "start"]