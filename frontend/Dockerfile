FROM node:22-alpine

# 1. Install compatibility libraries for Alpine
RUN apk add --no-cache libc6-compat

WORKDIR /app

# 2. Build Arguments (Crucial for Next.js)
# This allows docker-compose to pass the production API URL during the build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NODE_ENV=production

# 3. Install dependencies
COPY package*.json ./
# Using 'npm install' to ensure all build tools are present
RUN npm install

# 4. Copy source code
COPY . .

# 5. Build Next.js
# This command compiles your React code and embeds the API URL
RUN npm run build

# 6. Production Networking
EXPOSE 3002
ENV PORT=3002
# Allows Nginx to communicate with the container
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]