const express = require('express');
const cors = require('cors');
const { PubSub } = require('@google-cloud/pubsub');

const app = express();
const pubsub = new PubSub();
const TOPIC_NAME = 'recargasv2';
const PORT = process.env.PORT || 8080;

// Middlewares
app.use(express.json());
app.use(cors());

// Ruta principal para solicitud de recarga
app.post('/recarga', async (req, res) => {
  const { numero, monto } = req.body;

  // Validar datos de entrada
  if (!numero || !monto) {
    return res.status(400).json({ error: 'Datos faltantes' });
  }

  try {
    // Publicar mensaje en Pub/Sub
    await pubsub.topic(TOPIC_NAME).publishMessage({
      json: { 
        numero, 
        monto, 
        fecha: new Date().toISOString() 
      }
    });
    res.status(200).json({ mensaje: 'Solicitud de Recarga recibida' });
  } catch (error) {
    console.error('Error al publicar en Pub/Sub:', error);
    res.status(500).json({ error: 'No se pudo procesar la recarga' });
  }
});

// Levantar el servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});
