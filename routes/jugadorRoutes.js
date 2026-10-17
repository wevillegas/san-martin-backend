const express = require('express');
const router = express.Router();
const jugadorController = require('../controllers/jugadorController');

// 1. IMPORTAMOS LOS MIDDLEWARES
const authMiddleware = require('../middleware/authMiddleware'); // Tu seguridad
const upload = require('../config/cloudinary');
const soloAdmin = require('../middleware/rol')('administrador');
const camposProtegidos = require('../middleware/camposProtegidos'); // El portero de imágenes que creamos

// 2. DEFINIMOS LAS RUTAS

// POST: Crear Jugador
// ORDEN CRUCIAL: 1° Seguridad, 2° Procesar Imagen, 3° Controlador
router.post('/', authMiddleware, upload.single('imagen'), camposProtegidos, jugadorController.crearJugador);

// PUT: Actualizar Jugador
router.put('/:id', authMiddleware, upload.single('imagen'), camposProtegidos, jugadorController.actualizarJugador);

// GET: Obtener todos y por ID (estas no necesitan seguridad ni subir fotos)
router.get('/', jugadorController.obtenerJugadores);
router.get('/:id', jugadorController.obtenerJugadorPorId);

// DELETE: Eliminar
router.delete('/:id', authMiddleware, soloAdmin, jugadorController.eliminarJugador);

module.exports = router;