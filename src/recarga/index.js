const express = require('express');
const { PubSub } = require('@google-cloud/pubsub');
const { Firestore } = require('@google-cloud/firestore');

const SUBSCRIPTION_NAME = 'recargasv2';
const PORT = process.env.PORT || 8080;
const pubsub = new PubSub();
const firestore = new Firestore();
const app = express();

app.get('/', (_req, res) => res.send('OK'));

// Inicio del servidor HTTP
app.listen(PORT, () => {
  console.log(`Healthcheck escuchando en el puerto ${PORT}`);
});

// Lógica para escuchar mensajes de Pub/Sub
function startPubSubListener() {
  const subscription = pubsub.subscription(SUBSCRIPTION_NAME);

  subscription.on('message', async (message) => {
    let data;

    try {
      data = message.json || JSON.parse(Buffer.from(message.data, 'base64').toString());
    } catch (parseError) {
      console.error('Error al parsear el mensaje:', parseError);
      message.nack();
      return;
    }

    try {
      await firestore.collection('recargas').add({
        numero: data.numero,
        monto: data.monto,
        fecha: data.fecha || new Date().toISOString(),
        status: 'procesada'
      });
      console.log(`Recarga procesada: numero=${data.numero}, monto=${data.monto}`);
      message.ack();
    } catch (dbError) {
      console.error('Error al guardar en Firestore:', dbError);
      message.nack();
    }
  });

  subscription.on('error', (err) => {
    console.error('Error en la suscripción de Pub/Sub:', err);
  });

  console.log(`Escuchando mensajes de Pub/Sub en la suscripción "${SUBSCRIPTION_NAME}"...`);
}

// Iniciar escucha de mensajes
startPubSubListener();