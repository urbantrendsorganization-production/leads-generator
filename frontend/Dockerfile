# Frontend Dockerfile
FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build Next.js
# Note: NEXT_PUBLIC_API_URL should be set at build time if it's to be embedded in the static files.
# For Docker Compose, we can pass it during the build process.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
