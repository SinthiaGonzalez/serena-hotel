# 1) Compilar el front con Vite
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
# Vite mete estas variables en el JS al compilar: cambiarlas obliga a reconstruir
ARG VITE_API_URL VITE_GOOGLE_CLIENT_ID VITE_CLOUDINARY_CLOUD VITE_CLOUDINARY_PRESET
RUN npm run build

# 2) Servir lo compilado con Caddy (y pasar /api al back)
FROM caddy:2.9-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
