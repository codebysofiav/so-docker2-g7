# Taller de comandos Docker (1 hora)

**Proyecto:** DOCKER II: Despliegue con Docker Desktop y Docker Hub
**Subgrupo:** G7 · **Diseño del taller:** Sofía Vega

## Objetivo

Que quien haga el taller pueda crear, inspeccionar y eliminar contenedores, construir una imagen propia, orquestar varios servicios con Docker Compose y entender cómo Nginx actúa como proxy inverso, todo desde la terminal de Linux.

## Requisitos previos

- Ubuntu con Docker y Docker Compose (`docker --version` y `docker compose version` deben mostrar versión).
- El repositorio clonado y el archivo `.env` creado:

```bash
git clone https://github.com/codebysofiav/so-docker2-g7.git
cd so-docker2-g7
cp .env.example .env
```

- Conexión a internet (se descargan imágenes).

## Organización

| Estación | Minutos | Tema | En clase | Para casa |
|---|---|---|---|---|
| 1 | 0-15 | Imágenes y contenedores | Nginx en el puerto 8081 | Alpine interactivo con `curl` |
| 2 | 15-30 | Construcción de imágenes | Construir la imagen de la app | Cambiar la versión de Node |
| 3 | 30-45 | Docker Compose | Levantar y apagar el proyecto | Escalar y borrar volúmenes |
| 4 | 45-60 | Redes y proxy inverso | Ver cómo Nginx llega a la app | Agregar una ruta en Nginx |

---

## Estación 1 (0-15 min): Imágenes y contenedores

**Idea clave:** una imagen es la plantilla; un contenedor es una instancia en ejecución de esa plantilla.

### Práctica guiada

```bash
# 1. Descargar una imagen oficial
docker pull nginx:alpine

# 2. Ver las imágenes locales
docker images

# 3. Crear y arrancar un contenedor en segundo plano (-d), con nombre y puerto
#    -p 8081:80  =>  puerto 8081 del anfitrión -> puerto 80 del contenedor
docker run -d --name web-taller -p 8081:80 nginx:alpine

# 4. Ver los contenedores en ejecución
docker ps

# 5. Probar que responde (debe aparecer "Welcome to nginx!")
curl localhost:8081

# 6. Ver los registros del contenedor
docker logs web-taller

# 7. Entrar al contenedor y mirar su sistema de archivos
docker exec -it web-taller sh
ls /usr/share/nginx/html
exit

# 8. Detener y eliminar el contenedor
docker stop web-taller
docker rm web-taller
```

**Preguntas de comprensión**
1. ¿Qué diferencia hay entre `docker ps` y `docker ps -a`?
2. ¿Por qué se usó el puerto 8081 y no el 80 en el anfitrión?

### Reto para casa

Correr un contenedor de Alpine Linux en modo interactivo, instalar `curl` dentro y usarlo:

```bash
docker run -it --rm alpine sh
apk add --no-cache curl
curl --version
exit
```

Verificar después con `docker ps -a` que el contenedor ya no existe (por qué: opción `--rm`).

---

## Estación 2 (15-30 min): Construcción de imágenes

**Idea clave:** el `Dockerfile` describe, capa por capa, cómo se construye una imagen.

### Práctica guiada

```bash
cd ~/so-docker2-g7/app
cat Dockerfile

# 1. Construir la imagen con nombre y etiqueta (tag)
docker build -t app-so-g7:v1 .

# 2. Ver la imagen y sus capas
docker images | grep app-so-g7
docker history app-so-g7:v1

# 3. Ejecutarla con una variable de entorno y un volumen con nombre
#    (el volumen crea la carpeta /data donde la app guarda las visitas)
docker run -d --name app-test -p 3001:3000 \
  -v datos-test:/data -e APP_NAME=prueba app-so-g7:v1

# 4. Probarla
curl localhost:3001
curl localhost:3001/visitas

# 5. Limpiar
docker stop app-test
docker rm app-test
docker volume rm datos-test
```

**Preguntas de comprensión**
1. ¿Por qué se copia `package*.json` antes que el resto del código?
2. ¿Qué cambia en la respuesta de `curl localhost:3001` por usar `-e APP_NAME=prueba`?

### Reto para casa

Modificar el `Dockerfile` para usar una versión específica de Node (por ejemplo `node:18-alpine`), construir la imagen como `app-so-g7:v2` y comparar tamaños y versión:

```bash
docker build -t app-so-g7:v2 .
docker images | grep app-so-g7
docker run --rm app-so-g7:v2 node -v
```

---

## Estación 3 (30-45 min): Docker Compose

**Idea clave:** Compose describe todos los servicios, redes y volúmenes en un solo archivo y los maneja como una unidad.

### Práctica guiada

```bash
cd ~/so-docker2-g7
cat docker-compose.yml

# 1. Construir y levantar todo
docker compose up -d --build

# 2. Estado de los servicios
docker compose ps

# 3. Registros de un servicio
docker compose logs app

# 4. Ejecutar un comando dentro de un servicio (debe responder PONG)
docker compose exec redis redis-cli ping

# 5. Probar la app a través de Nginx
curl localhost:8080
curl localhost:8080/visitas

# 6. Apagar (conserva los volúmenes) y volver a levantar
docker compose down
docker volume ls
docker compose up -d
curl localhost:8080/visitas      # las visitas anteriores siguen ahí
```

**Preguntas de comprensión**
1. ¿Qué diferencia hay entre `docker compose stop` y `docker compose down`?
2. ¿Por qué siguen las visitas después de `down`?

### Reto para casa

1. Escalar la app a 3 réplicas y contar cuántas peticiones atiende cada una:

```bash
docker compose up -d --scale app=3
docker compose restart nginx
for i in $(seq 1 30); do curl -s localhost:8080 | grep -o '"contenedor":"[^"]*"'; done | sort | uniq -c
```

2. Apagar con `docker compose down -v` y comprobar que el log de visitas se reinicia.

---

## Estación 4 (45-60 min): Redes y proxy inverso

**Idea clave:** los servicios de un mismo compose comparten una red y se encuentran por nombre. Solo Nginx publica un puerto hacia afuera.

### Práctica guiada

```bash
cd ~/so-docker2-g7
cat nginx/nginx.conf

# 1. Ver las redes y los contenedores conectados a la del proyecto
docker network ls
docker network inspect so-docker2-g7_red-so

# 2. La app NO es accesible directamente desde el anfitrión (falla)
curl localhost:3000

# 3. Pero Nginx sí la alcanza por su nombre de servicio
docker compose exec nginx wget -qO- http://app:3000

# 4. Y desde el anfitrión se llega a ella a través del proxy
curl localhost:8080
```

**Preguntas de comprensión**
1. ¿Por qué `proxy_pass` usa `http://app:3000` y no una dirección IP?
2. ¿Qué ventaja de seguridad tiene que solo Nginx publique un puerto?

### Reto para casa

Agregar en `nginx/nginx.conf`, dentro del bloque `server`, una ruta que Nginx responda por sí mismo:

```cat > nginx/nginx.conf << 'EOF'
server {
  listen 80;

  # Ruta que Nginx responde por sí mismo
  location /salud {
    default_type text/plain;
    return 200 'ok';
  }

  # Todo lo demás se reenvía a la app
  location / {
    # "app" es el nombre del servicio en docker-compose
    proxy_pass http://app:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
EOF
```

Validar la configuración y recargarla sin apagar nada:

```bash
docker compose exec nginx nginx -t
docker compose restart nginx
curl localhost:8080/salud
```

---

## Cierre y limpieza

```bash
docker compose down            # apaga el proyecto (conserva volúmenes)
docker compose down -v         # apaga y borra volúmenes
docker system prune -f         # elimina contenedores detenidos e imágenes sin uso
```

## Comandos de referencia

| Comando | Para qué sirve |
|---|---|
| `docker pull` / `docker images` | Descargar y listar imágenes |
| `docker run` / `docker ps` | Crear contenedores y listar los activos |
| `docker logs` / `docker exec` | Ver registros y ejecutar comandos dentro |
| `docker stop` / `docker rm` | Detener y eliminar contenedores |
| `docker build -t` | Construir una imagen etiquetada |
| `docker volume ls` / `docker network ls` | Listar volúmenes y redes |
| `docker compose up -d --build` | Construir y levantar el proyecto |
| `docker compose up -d --scale app=N` | Escalar un servicio a N réplicas |
| `docker compose down [-v]` | Apagar el proyecto (y borrar volúmenes) |
