const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');

// IMPORTAMOS LOS MIDDLEWARES (Ajustá las rutas si hace falta)
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/cloudinary');
const soloAdmin = require('../middleware/rol')('administrador');
const camposProtegidos = require('../middleware/camposProtegidos'); 

// POST: Crear Producto (Protegido + Imagen)
router.post('/', authMiddleware, upload.single('imagen'), camposProtegidos, productoController.crearProducto);

// PUT: Actualizar Producto (Protegido + Imagen)
router.put('/:id', authMiddleware, upload.single('imagen'), camposProtegidos, productoController.actualizarProducto);

// GET: Obtener todos y por ID (Públicos)
router.get('/', productoController.obtenerProductos);
router.get('/:id', productoController.obtenerProductoPorId);

// DELETE: Eliminar (Protegido)
router.delete('/:id', authMiddleware, soloAdmin, productoController.eliminarProducto);

module.exports = router;