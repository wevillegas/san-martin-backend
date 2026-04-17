const express = require('express');
const router = express.Router();
const noticiaController = require('../controllers/noticiaController');

// Rutas
router.post('/', noticiaController.crearNoticia);
router.get('/', noticiaController.obtenerNoticias);
router.get('/:id', noticiaController.obtenerNoticiaPorId);
// Ruta para ACTUALIZAR una noticia (PUT)
router.put('/:id', noticiaController.actualizarNoticia);

// Ruta para ELIMINAR una noticia (DELETE)
router.delete('/:id', noticiaController.eliminarNoticia);

module.exports = router;