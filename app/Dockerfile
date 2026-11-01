# Imagen base ligera de Node
FROM node:20-alpine
# Carpeta de trabajo dentro del contenedor
WORKDIR /usr/src/app
# Primero las dependencias (aprovecha la caché de capas)
COPY package*.json ./
RUN npm install --omit=dev
# Luego el código
COPY . .
# Puerto que usa la app
EXPOSE 3000
# Comando de arranque
CMD ["node", "server.js"]
