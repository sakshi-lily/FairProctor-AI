# Stage 1: Build frontend
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY . .

# Build React application
RUN npm run build

# Stage 2: Production server with SSL support
FROM nginx:alpine

# Install OpenSSL and generate a self-signed SSL certificate for HTTPS
RUN apk add --no-cache openssl && \
    mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/nginx.key \
    -out /etc/nginx/ssl/nginx.crt \
    -subj "/C=US/ST=Fair/L=Proctor/O=FairProctor-AI/OU=Production/CN=54.227.106.80"

# Copy custom Nginx configuration with reverse proxy, SPA routing & SSL
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled frontend distribution
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]

