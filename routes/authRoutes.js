const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Limita los intentos de login para frenar fuerza bruta de contraseña
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos por IP en la ventana
    message: { mensaje: "Demasiados intentos de inicio de sesión. Intenta de nuevo en 15 minutos." },
    skipSuccessfulRequests: true // Un login correcto no cuenta contra el límite
});

// Ruta para Registrar (POST) -> /api/auth/register
// Protegida: solo un admin ya logueado puede crear otro admin
router.post('/register', authMiddleware, authController.registrarUsuario);

// Ruta para Iniciar Sesión (POST) -> /api/auth/login
router.post('/login', loginLimiter, authController.loginUsuario);

// Ruta para renovar la sesión (POST) -> /api/auth/renovar
router.post('/renovar', authMiddleware, authController.renovarToken);

module.exports = router;