const express = require('express');
const { Firestore } = require('@google-cloud/firestore');

const PROJECT_ID = 'grounded-pivot-459800-v1';
const PORT = process.env.PORT || 8080;

// Inicialización de servicios
const app = express();
const firestore = new Firestore({ projectId: PROJECT_ID });

// Middlewares
app.use(express.json());

// Rutas
app.get('/', (_req, res) => {
  res.status(200).send('OK');
});

app.post('/registrar-venta', async (req, res) => {
  const { numero, monto, fecha } = req.body;

  if (!numero || !monto) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  try {
    await firestore.collection('ventas').add({
      numero,
      monto,
      fecha: fecha || new Date().toISOString(),
      status: 'procesada'
    });
    res.status(200).json({ mensaje: 'Venta registrada' });
  } catch (error) {
    console.error('Error al registrar venta:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Inicio del servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servicio de Registro de Venta escuchando en ${PORT}`);
});