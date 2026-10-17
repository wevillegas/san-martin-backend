const express = require('express');
const router = express.Router();
const usuarios = require('../controllers/usuarioController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, usuarios.listar);
router.put('/me/password', auth, usuarios.cambiarMiPassword); // antes que /:id para que "me" no se tome como id
router.put('/:id/password', auth, usuarios.restablecerPassword);
router.delete('/:id', auth, usuarios.eliminar);

module.exports = router;
