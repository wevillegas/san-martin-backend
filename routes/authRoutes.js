const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta para Registrar (POST) -> /api/auth/register
router.post('/register', authController.registrarUsuario);

// Ruta para Iniciar Sesión (POST) -> /api/auth/login
router.post('/login', authController.loginUsuario);

module.exports = router;