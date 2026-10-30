FROM node:22-alpine
WORKDIR /app

# Primero solo las dependencias: si no cambian, Docker reutiliza esta capa
COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
USER node
EXPOSE 3001
CMD ["node", "index.js"]
