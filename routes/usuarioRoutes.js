const express = require('express');
const router = express.Router();
const usuarios = require('../controllers/usuarioController');
const auth = require('../middleware/authMiddleware');
const soloAdmin = require('../middleware/rol')('administrador');


router.get('/', auth, soloAdmin, usuarios.listar);
router.put('/me/password', auth, usuarios.cambiarMiPassword); // antes que /:id para que "me" no se tome como id
router.put('/:id/password', auth, soloAdmin, usuarios.restablecerPassword);
router.put('/:id/rol', auth, soloAdmin, usuarios.cambiarRol);
router.delete('/:id', auth, soloAdmin, usuarios.eliminar);

module.exports = router;
