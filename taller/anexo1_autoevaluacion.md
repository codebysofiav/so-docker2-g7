# Anexo 1: Preguntas de autoevaluación

**Proyecto:** DOCKER II: Despliegue con Docker Desktop y Docker Hub · **Subgrupo:** G7

**1. ¿En qué se diferencia un contenedor de una máquina virtual?**
Una máquina virtual incluye un sistema operativo completo y se ejecuta sobre un hipervisor. Un contenedor comparte el kernel del sistema anfitrión y solo aísla los procesos con namespaces y cgroups. Por eso arranca en segundos y consume menos memoria y disco.

**2. ¿Qué diferencia hay entre una imagen y un contenedor?**
La imagen es una plantilla de solo lectura, formada por capas. El contenedor es una instancia en ejecución de esa imagen, con una capa de escritura propia. De una misma imagen pueden salir muchos contenedores.

**3. En el Dockerfile del proyecto, ¿por qué se copia `package*.json` y se ejecuta `npm install` antes de copiar el resto del código?**
Docker guarda en caché cada capa. Si el código cambia pero las dependencias no, la capa de `npm install` se reutiliza y la construcción es mucho más rápida.

**4. ¿Qué diferencia hay entre `expose` y `ports` en Docker Compose?**
`expose` solo declara un puerto visible para los demás servicios de la red interna. `ports` lo publica en el anfitrión (por ejemplo `8080:80`) y lo hace accesible desde fuera.

**5. ¿Por qué el servicio `app` no tiene un puerto fijo publicado y por eso se puede escalar?**
Dos contenedores no pueden ocupar el mismo puerto del anfitrión. Sin `ports` en `app`, se pueden crear varias réplicas y solo Nginx publica un puerto.

**6. ¿Qué pasa con los datos de un volumen al ejecutar `docker compose down` y al ejecutar `docker compose down -v`?**
Con `down` los contenedores y la red se eliminan, pero los volúmenes se conservan, así que los datos persisten. Con `down -v` los volúmenes también se borran y los datos se pierden.

**7. ¿Qué función cumple Nginx como proxy inverso en este proyecto?**
Recibe las peticiones HTTP externas en el puerto 8080 y las reenvía al servicio `app` con `proxy_pass`, repartiéndolas entre las réplicas. Así los servicios internos no se exponen directamente.

**8. ¿Por qué en `proxy_pass` se usa `http://app:3000` y no una dirección IP?**
Docker incluye un DNS interno que resuelve el nombre de cada servicio a la IP de sus contenedores. Las IP cambian cada vez que se recrean, pero el nombre del servicio no.

**9. Después de ejecutar `docker compose up -d --scale app=3`, ¿por qué conviene reiniciar Nginx?**
Nginx resuelve el nombre `app` una sola vez, al arrancar. Si se escala después, no conoce las réplicas nuevas hasta que se reinicia o se recarga.

**10. ¿Para qué sirve el archivo `.env` y por qué no debe subirse a GitHub?**
Guarda las variables de entorno (puertos, nombres, credenciales) que Compose inyecta en los contenedores. Puede contener datos sensibles, por eso se excluye con `.gitignore` y se publica solo un `.env.example` sin secretos.

**11. Para publicar una imagen en Docker Hub, ¿por qué hay que etiquetarla con `docker tag` antes de `docker push`?**
Docker Hub identifica las imágenes con el formato `usuario/repositorio:etiqueta`. La imagen local tiene otro nombre, así que se le crea una etiqueta nueva que lo cumpla y luego se sube con `docker push`.

**12. ¿Qué hace la opción `-d` en `docker run` y en `docker compose up`?**
Ejecuta los contenedores en segundo plano (modo *detached*), de modo que la terminal queda libre y los registros se consultan con `docker logs`.
