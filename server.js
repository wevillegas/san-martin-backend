const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ==========================================
//        MIDDLEWARES DE SEGURIDAD
// ==========================================

// 1. Helmet: Protege el servidor configurando varias cabeceras HTTP seguras
app.use(helmet());

// 2. Rate Limiter: Mitiga ataques de fuerza bruta y DDoS limitando peticiones por IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Ventana de 15 minutos
    max: 150, // Limita cada IP a 150 peticiones por ventana
    message: { mensaje: "Demasiadas peticiones desde esta IP. Por favor, intenta de nuevo más tarde." }
});
app.use(limiter);

// 3. CORS Restringido: Solo permite acceso a tu entorno local o al dominio real en producción
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Permite que el servidor procese datos en formato JSON
app.use(express.json());

// ==========================================
//         CONEXIÓN A BASE DE DATOS
// ==========================================
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('¡Conectado a la base de datos de MongoDB!'))
    .catch((error) => console.error('Error conectando a MongoDB:', error));

// ==========================================
//           DEFINICIÓN DE RUTAS
// ==========================================
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/jugadores', require('./routes/jugadorRoutes'));
app.use('/api/noticias', require('./routes/noticiaRoutes'));
app.use('/api/cuerpo-tecnico', require('./routes/cuerpoTecnicoRoutes'));
app.use('/api/productos', require('./routes/productoRoutes'));
app.use('/api/fixture', require('./routes/fixtureRoutes'));

// Ruta de cortesía para verificación de estado
app.get('/', (req, res) => {
    res.send('Servidor del Club Atlético San Martín de Tucumán - Online');
});

// ==========================================
//         CONFIGURACIÓN DEL PUERTO
// ==========================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo de forma segura en el puerto ${PORT}`);
});