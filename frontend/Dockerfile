FROM node:22-alpine

RUN apk add --no-cache libc6-compat

WORKDIR /app

# Build Arguments
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NODE_ENV=production

COPY package*.json ./

# Use 'install' to ensure the new postcss packages are picked up
RUN npm install

COPY . .

# Build Next.js with the correct API URL baked in
RUN npm run build

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["npm", "start"]