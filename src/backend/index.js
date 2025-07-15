const express = require('express');
const {PubSub} = require('@google-cloud/pubsub');
const pubsub = new PubSub();
const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors());
const TOPIC_NAME = 'recarga';

app.post('/recarga', async (req, res) => {
  const {numero, monto} = req.body;
  if (!numero || !monto) return res.status(400).send('Datos faltantes');
  await pubsub.topic(TOPIC_NAME).publishMessage({ json: { numero, monto, fecha: new Date().toISOString() }});
  res.status(200).send('Solicitud de Recarga recibida');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Servidor escuchando en ${PORT}`));
