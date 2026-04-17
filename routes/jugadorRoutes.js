const express = require('express');
const router = express.Router();
const jugadorController = require('../controllers/jugadorController');

// Ruta para CREAR un jugador (POST)
router.post('/', jugadorController.crearJugador);

// Ruta para OBTENER TODOS los jugadores (GET)
router.get('/', jugadorController.obtenerJugadores);

// Ruta para OBTENER UN SOLO jugador por su ID (GET)
router.get('/:id', jugadorController.obtenerJugadorPorId);

// Ruta para ACTUALIZAR un jugador (PUT)
router.put('/:id', jugadorController.actualizarJugador);

// Ruta para ELIMINAR un jugador (DELETE)
router.delete('/:id', jugadorController.eliminarJugador);

module.exports = router;