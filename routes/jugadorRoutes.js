const express = require('express');
const router = express.Router();
const jugadorController = require('../controllers/jugadorController');
const auth = require('../middleware/authMiddleware'); // <-- IMPORTAMOS EL GUARDIA

// Rutas Públicas (Cualquiera entra)
router.get('/', jugadorController.obtenerJugadores);
router.get('/:id', jugadorController.obtenerJugadorPorId);

// Rutas Privadas (Solo pasan los que tienen el Token)
// Fijate cómo ponemos la palabra "auth" en el medio
router.post('/', auth, jugadorController.crearJugador);
router.put('/:id', auth, jugadorController.actualizarJugador);
router.delete('/:id', auth, jugadorController.eliminarJugador);

module.exports = router;