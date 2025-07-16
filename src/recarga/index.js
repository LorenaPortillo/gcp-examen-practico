const {PubSub} = require('@google-cloud/pubsub');
const {Firestore} = require('@google-cloud/firestore');
const express = require('express');


const firestore = new Firestore({ projectId: 'grounded-pivot-459800-v1' });
const pubsub = new PubSub({ projectId: 'grounded-pivot-459800-v1' });

const subscriptionName = 'recargasv2';
 
const app = express();
const PORT = process.env.PORT || 8080;
 
app.get('/', (req, res) => res.send('OK'));
app.listen(PORT, () => console.log(`Healthcheck en ${PORT}`));
 
function listenMessages() {
  const subscription2 = pubsub.subscription(subscriptionName);
  subscription2.on('message', async (message) => {
    try {
      const data = message.json || JSON.parse(Buffer.from(message.data, 'base64').toString());
      await firestore.collection('recargas').add({
        numero: data.numero,
        monto: data.monto,
        fecha: data.fecha || new Date().toISOString(),
        status: 'procesada'
      });
      console.log(`Recarga procesada para ${data.numero} por ${data.monto}`);
      message.ack();
    } catch (err) {
      console.error('Error procesando mensaje:', err);
    }
  });
