FROM node:22-alpine

# 1. Install necessary libraries for Prisma Engine on Alpine
RUN apk add --no-cache openssl libc6-compat libcrypto3

WORKDIR /app

# 2. Set to development so npm installs TypeScript (tsc)
ENV NODE_ENV=development
ENV DATABASE_URL="postgresql://trendyyleads:trendyyleads_dev@postgres:5432/trendyyleads"

COPY package*.json ./

# 3. Install ALL dependencies (including devDependencies)
RUN npm install

COPY . .

# 4. Remove any existing generated client to force a fresh build
RUN rm -rf ./node_modules/.prisma ./node_modules/@prisma/client

# 5. Generate Prisma client
ENV PRISMA_CLI_BINARY_TARGET=linux-musl-openssl-3.0.x
RUN npx prisma generate

# 6. Build the TypeScript source
# We use npx to ensure the local tsc is found
RUN npx tsc

EXPOSE 3001

# 7. Now switch to production for the actual runtime
ENV NODE_ENV=production

# Use the compiled JS in the dist/build folder
CMD ["node", "dist/index.js"]