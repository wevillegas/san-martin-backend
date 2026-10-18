const express = require('express');
const router = express.Router();
const propio = require('../middleware/propio');
const ocultarCreador = require('../middleware/ocultarCreador');
const authOpcional = require('../middleware/authOpcional');
const Producto = require('../models/Producto');
const productoController = require('../controllers/productoController');

// IMPORTAMOS LOS MIDDLEWARES (Ajustá las rutas si hace falta)
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../config/cloudinary');
const camposProtegidos = require('../middleware/camposProtegidos'); 

// POST: Crear Producto (Protegido + Imagen)
router.post('/', authMiddleware, upload.single('imagen'), camposProtegidos, productoController.crearProducto);

// PUT: Actualizar Producto (Protegido + Imagen)
router.put('/:id', authMiddleware, propio(Producto), upload.single('imagen'), camposProtegidos, productoController.actualizarProducto);

// GET: Obtener todos y por ID (Públicos)
router.get('/', authOpcional, ocultarCreador, productoController.obtenerProductos);
router.get('/:id', authOpcional, ocultarCreador, productoController.obtenerProductoPorId);

// DELETE: Eliminar (Protegido)
router.delete('/:id', authMiddleware, propio(Producto), productoController.eliminarProducto);

module.exports = router;