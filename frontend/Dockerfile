# Stage 1: Build React app
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source and build
COPY . .

# Accept API URL at build time
ARG VITE_APP_API_URL=http://localhost:8081
ENV VITE_APP_API_URL=${VITE_APP_API_URL}

RUN yarn build

# Stage 2: Serve with Nginx
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html/react
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
