const express = require('express');
const router = express.Router();
const noticiaController = require('../controllers/noticiaController');
const auth = require('../middleware/authMiddleware'); // <-- IMPORTAMOS EL GUARDIA

// Rutas Públicas
router.get('/', noticiaController.obtenerNoticias);
router.get('/:id', noticiaController.obtenerNoticiaPorId);

// Rutas Privadas
router.post('/', auth, noticiaController.crearNoticia);
router.put('/:id', auth, noticiaController.actualizarNoticia);
router.delete('/:id', auth, noticiaController.eliminarNoticia);

module.exports = router;