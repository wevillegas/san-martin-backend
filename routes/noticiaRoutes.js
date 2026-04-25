const express = require('express');
const router = express.Router();
const noticiaController = require('../controllers/noticiaController');
const auth = require('../middleware/authMiddleware'); // <-- IMPORTAMOS EL GUARDIA
const upload = require('../config/cloudinary'); // <-- IMPORTAMOS EL PORTERO DE IMÁGENES

// Rutas Públicas
router.get('/', noticiaController.obtenerNoticias);
router.get('/:id', noticiaController.obtenerNoticiaPorId);

// Rutas Privadas
router.post('/', auth, upload.single('imagen'), noticiaController.crearNoticia);
router.put('/:id', auth, upload.single('imagen'), noticiaController.actualizarNoticia);
router.delete('/:id', auth, noticiaController.eliminarNoticia);

module.exports = router;