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

# Stage 2: Production server
FROM nginx:alpine

# Copy custom Nginx configuration with reverse proxy & SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled frontend distribution
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
