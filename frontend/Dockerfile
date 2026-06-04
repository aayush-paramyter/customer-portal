FROM node:20.15-alpine AS build

WORKDIR /app

ARG VITE_PORTAL_API_BASE=
ENV VITE_PORTAL_API_BASE=$VITE_PORTAL_API_BASE

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Optional: set PORTAL_API_UPSTREAM at runtime (e.g. customer-portal-api:8011) for same-origin /api proxy
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
