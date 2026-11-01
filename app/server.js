const express = require('express');
const os = require('os');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;
const APP_NAME = process.env.APP_NAME || 'app-so-g7';

// Respuesta básica: muestra qué contenedor atendió la petición
app.get('/', (req, res) => {
  res.json({ app: APP_NAME, contenedor: os.hostname(), entorno: process.env.NODE_ENV });
});

// Prueba de volumen: cada visita queda registrada en /data
app.get('/visitas', (req, res) => {
  fs.appendFileSync('/data/visitas.log', `${new Date().toISOString()} ${os.hostname()}\n`);
  res.type('text').send(fs.readFileSync('/data/visitas.log', 'utf8'));
});

app.get('/health', (req, res) => res.send('ok'));
app.listen(PORT, () => console.log(`Escuchando en ${PORT}`));
