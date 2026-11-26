# Stage 1: Build React app
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies using npm
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

# Copy source and build
COPY . .

# Accept API URL at build time
ARG VITE_APP_API_URL=http://localhost:8081
ARG VITE_APP_GOOGLE_CLIENT_ID=
ENV VITE_APP_API_URL=${VITE_APP_API_URL}
ENV VITE_APP_GOOGLE_CLIENT_ID=${VITE_APP_GOOGLE_CLIENT_ID}

# Serve app at root path instead of /react
# Override .env because build script uses `env-cmd -f .env`
RUN grep -v -e '^VITE_APP_BASE_NAME' -e '^VITE_APP_API_URL' -e '^VITE_APP_GOOGLE_CLIENT_ID' .env > .env.tmp && \
    mv .env.tmp .env && \
    echo 'VITE_APP_BASE_NAME=/' >> .env && \
    echo "VITE_APP_API_URL=${VITE_APP_API_URL}" >> .env && \
    echo "VITE_APP_GOOGLE_CLIENT_ID=${VITE_APP_GOOGLE_CLIENT_ID}" >> .env

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
