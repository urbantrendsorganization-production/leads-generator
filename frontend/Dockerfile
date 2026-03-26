FROM node:22-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Build Arguments
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

COPY package*.json ./

# Install all deps (including devDependencies needed for the build)
RUN npm install --include=dev

COPY . .

# Build Next.js with the correct API URL baked in
RUN npm run build

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV=production

CMD ["npm", "start"]