FROM node:24-alpine AS build
WORKDIR /app

# Variables públicas del frontend (quedan dentro del bundle; nada secreto).
# Se pasan como build args: docker build --build-arg API_URL=https://...
ARG API_URL
ARG ANALYTICS_SCRIPT_URL=""
ARG ANALYTICS_WEBSITE_ID=""
ENV API_URL=$API_URL \
    ANALYTICS_SCRIPT_URL=$ANALYTICS_SCRIPT_URL \
    ANALYTICS_WEBSITE_ID=$ANALYTICS_WEBSITE_ID

COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:qa

FROM nginx:alpine
COPY --from=build /app/dist/gamescraping/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
