FROM node:22-alpine

# 1. Install dependencies for Sharp (optimized images) and libc compatibility
RUN apk add --no-cache libc6-compat

WORKDIR /app

# 2. Handle environment variables for the build
# These MUST be ARGs to be passed from docker-compose during 'build'
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NODE_ENV=production

COPY package*.json ./

# 3. Use npm ci for a faster, more reliable "clean install" in production
RUN npm ci

COPY . .

# 4. Build the Next.js application
# The NEXT_PUBLIC_API_URL is embedded into the static chunks here
RUN npm run build

# 5. Production setup
EXPOSE 3000
ENV PORT=3000
# Ensure Next.js binds to all network interfaces inside the container
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]