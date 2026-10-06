FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=/api
ARG VITE_JITSI_DOMAIN=meet.jit.si
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_JITSI_DOMAIN=${VITE_JITSI_DOMAIN}

RUN npm run build

FROM nginx:1.27-alpine AS production

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
