const express = require('express');
const router = express.Router();
const propio = require('../middleware/propio');
const ocultarCreador = require('../middleware/ocultarCreador');
const authOpcional = require('../middleware/authOpcional');
const CuerpoTecnico = require('../models/CuerpoTecnico');
const ctController = require('../controllers/cuerpoTecnicoController');

// Middlewares
const auth = require('../middleware/authMiddleware');
const upload = require('../config/cloudinary');
const camposProtegidos = require('../middleware/camposProtegidos');

// Rutas Públicas
router.get('/', authOpcional, ocultarCreador, ctController.obtenerCuerpoTecnico);
router.get('/:id', authOpcional, ocultarCreador, ctController.obtenerMiembroPorId);

// Rutas Protegidas (Requieren Login)
router.post('/', auth, upload.single('imagen'), camposProtegidos, ctController.crearMiembro);
router.put('/:id', auth, propio(CuerpoTecnico), upload.single('imagen'), camposProtegidos, ctController.actualizarMiembro);
router.delete('/:id', auth, propio(CuerpoTecnico), ctController.eliminarMiembro);

module.exports = router;