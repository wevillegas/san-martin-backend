const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 1. Importamos el middleware de seguridad (ajustá la ruta si tu archivo se llama distinto)
const authMiddleware = require('../middleware/authMiddleware');

// Ruta para Registrar (POST) -> /api/auth/register
// 2. Metemos el authMiddleware en el medio. Ahora exige token sí o sí.
router.post('/register', authMiddleware, authController.registrarUsuario);

// Ruta para Iniciar Sesión (POST) -> /api/auth/login
// Esta queda 100% pública para poder entrar.
router.post('/login', authController.loginUsuario);

module.exports = router;