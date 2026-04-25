const express = require('express');
const router = express.Router();
const ctController = require('../controllers/cuerpoTecnicoController');

// Middlewares
const auth = require('../middleware/authMiddleware');
const upload = require('../config/cloudinary');

// Rutas Públicas
router.get('/', ctController.obtenerCuerpoTecnico);
router.get('/:id', ctController.obtenerMiembroPorId);

// Rutas Protegidas (Requieren Login)
router.post('/', auth, upload.single('imagen'), ctController.crearMiembro);
router.put('/:id', auth, upload.single('imagen'), ctController.actualizarMiembro);
router.delete('/:id', auth, ctController.eliminarMiembro);

module.exports = router;