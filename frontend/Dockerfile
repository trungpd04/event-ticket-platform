# Stage 1: Build React app
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies using npm
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build
COPY . .

# Accept API URL at build time
ARG VITE_APP_API_URL=http://localhost:8081
ENV VITE_APP_API_URL=${VITE_APP_API_URL}

# Serve app at root path instead of /react
# Override .env because build script uses `env-cmd -f .env`
RUN grep -v '^VITE_APP_BASE_NAME' .env > .env.tmp && mv .env.tmp .env && echo 'VITE_APP_BASE_NAME=/' >> .env

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
