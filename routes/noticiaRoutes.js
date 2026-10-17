const express = require('express');
const router = express.Router();
const noticiaController = require('../controllers/noticiaController');
const auth = require('../middleware/authMiddleware'); // <-- IMPORTAMOS EL GUARDIA
const upload = require('../config/cloudinary');
const soloAdmin = require('../middleware/rol')('administrador');
const camposProtegidos = require('../middleware/camposProtegidos');
const authOpcional = require('../middleware/authOpcional'); // deja ver borradores a los administradores // <-- IMPORTAMOS EL PORTERO DE IMÁGENES

// Rutas Públicas
router.get('/', authOpcional, noticiaController.obtenerNoticias);
router.get('/:id', authOpcional, noticiaController.obtenerNoticiaPorId);

// Rutas Privadas
router.post('/', auth, upload.single('imagen'), camposProtegidos, noticiaController.crearNoticia);
router.put('/:id', auth, upload.single('imagen'), camposProtegidos, noticiaController.actualizarNoticia);
router.delete('/:id', auth, soloAdmin, noticiaController.eliminarNoticia);

module.exports = router;