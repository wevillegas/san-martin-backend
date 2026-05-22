const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('¡Conectado a la base de datos de MongoDB!'))
    .catch((error) => console.error('Error conectando a MongoDB:', error));

// Definición de Rutas (Limpias y ordenadas)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jugadores', require('./routes/jugadorRoutes'));
app.use('/api/noticias', require('./routes/noticiaRoutes'));
app.use('/api/cuerpo-tecnico', require('./routes/cuerpoTecnicoRoutes'));
app.use('/api/productos', require('./routes/productoRoutes'));

// ---> ACÁ AGREGAMOS LA NUEVA RUTA DEL FIXTURE <---
app.use('/api/fixture', require('./routes/fixtureRoutes'));


// Ruta de cortesía
app.get('/', (req, res) => {
    res.send('Servidor del Club Atlético San Martín de Tucumán - Online');
});

// Configuración del Puerto
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});