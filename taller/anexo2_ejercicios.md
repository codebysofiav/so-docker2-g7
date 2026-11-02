# Anexo 2: Ejercicios propuestos y solución

**Proyecto:** DOCKER II: Despliegue con Docker Desktop y Docker Hub · **Subgrupo:** G7

Todos los ejercicios se ejecutan en Ubuntu, dentro de la carpeta del proyecto (`~/so-docker2-g7`), con el proyecto levantado (`docker compose up -d --build`). Cada uno termina con la evidencia que debe mostrar la captura.

---

## Ejercicio 1: Variables de entorno

**Enunciado.** Cambia el nombre de la aplicación a `mi-app-g7` solo modificando el archivo `.env`, sin tocar el código ni reconstruir la imagen, y comprueba que la respuesta de la app cambia.

**Solución.**

```bash
# 1. Respuesta actual
curl localhost:8080

# 2. Cambiar la variable
sed -i 's/^APP_NAME=.*/APP_NAME=mi-app-g7/' .env
cat .env

# 3. Compose detecta el cambio y recrea el contenedor
docker compose up -d

# 4. Verificar
curl localhost:8080
```

**Resultado esperado.** El campo `app` pasa de `app-so-g7` a `mi-app-g7`.
**Evidencia.** Captura con las dos respuestas de `curl` y el contenido del `.env`.

---

## Ejercicio 2: Persistencia con volúmenes

**Enunciado.** Demuestra que los datos del volumen `datos` sobreviven a `docker compose down`, y que se pierden al usar `docker compose down -v`.

**Solución.**

```bash
# 1. Generar visitas
curl -s localhost:8080/visitas > /dev/null
curl -s localhost:8080/visitas

# 2. Apagar conservando volúmenes y volver a levantar
docker compose down
docker compose up -d
curl -s localhost:8080/visitas        # las líneas anteriores siguen ahí

# 3. Apagar borrando volúmenes y volver a levantar
docker compose down -v
docker compose up -d
curl -s localhost:8080/visitas        # solo aparece la visita nueva
```

**Resultado esperado.** Tras `down` el log conserva las visitas; tras `down -v` el log empieza de cero.
**Evidencia.** Captura de las tres salidas de `/visitas`, con los comandos visibles.

---

## Ejercicio 3: Escalamiento y balanceo

**Enunciado.** Escala el servicio `app` a 5 réplicas, comprueba que Nginx reparte las peticiones entre ellas y luego redúcelo a 2.

**Solución.**

```bash
# 1. Escalar a 5 y reiniciar Nginx para que conozca las réplicas
docker compose up -d --scale app=5
docker compose restart nginx
docker compose ps

# 2. Contar cuántas peticiones atiende cada contenedor
for i in $(seq 1 50); do curl -s localhost:8080 | grep -o '"contenedor":"[^"]*"'; done | sort | uniq -c

# 3. Reducir a 2 réplicas
docker compose up -d --scale app=2
docker compose restart nginx
docker compose ps
```

**Resultado esperado.** En el paso 2 aparecen 5 identificadores de contenedor con cantidades similares; después del paso 3 solo quedan 2 réplicas de `app`.
**Evidencia.** Captura de `docker compose ps` con 5 réplicas y del conteo con `uniq -c`.

---

## Ejercicio 4: Redes y aislamiento

**Enunciado.** Demuestra que la aplicación no es accesible directamente desde el anfitrión, pero sí desde dentro de la red de Docker a través de su nombre de servicio.

**Solución.**

```bash
# 1. Desde el anfitrión, el puerto 3000 no responde (debe fallar)
curl localhost:3000

# 2. Desde el contenedor de Nginx, el nombre "app" sí se resuelve
docker compose exec nginx wget -qO- http://app:3000

# 3. Inspeccionar la red del proyecto
docker network inspect so-docker2-g7_red-so | grep -E '"Name"|IPv4Address'
```

**Resultado esperado.** El paso 1 muestra `Connection refused`; el paso 2 devuelve el JSON de la app; el paso 3 lista los contenedores conectados con sus IP internas.
**Evidencia.** Captura de las tres salidas.
