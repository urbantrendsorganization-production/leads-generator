FROM node:22-alpine

# Required by Prisma engine on Alpine
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Install ALL deps first (TypeScript is a devDependency)
COPY package*.json ./
RUN npm install

COPY . .

# Remove any cached Prisma client to force a clean generate
RUN rm -rf ./node_modules/.prisma ./node_modules/@prisma/client

# Generate Prisma client for Alpine/musl
ENV PRISMA_CLI_BINARY_TARGET=linux-musl-openssl-3.0.x
RUN npx prisma generate

# Compile TypeScript → dist/
RUN npx tsc

EXPOSE 3001

ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
