const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middlewares
// CORS permite que el frontend (React) se comunique con el backend sin bloqueos de seguridad
app.use(cors());
// Permite que el servidor entienda y procese datos en formato JSON
app.use(express.json());

// Conexión a MongoDB Atlas usando la URI de las variables de entorno
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('¡Conectado a la base de datos de MongoDB!'))
    .catch((error) => console.error('Error conectando a MongoDB:', error));

// Definición de Rutas
// Todas las rutas de jugadores empezarán con /api/jugadores
app.use('/api/jugadores', require('./routes/jugadorRoutes'));
app.use('/api/noticias', require('./routes/noticiaRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));
// Asegurate de poner la ruta correcta hacia el archivo
app.use('/api/cuerpo-tecnico', require('./routes/cuerpoTecnicoRoutes'));

// Ruta de cortesía para verificar que el servidor está en línea
app.get('/', (req, res) => {
    res.send('Servidor del Club Atlético San Martín de Tucumán - Online');
});

// Configuración del Puerto
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});