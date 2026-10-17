const express = require('express');
const router = express.Router();
const papelera = require('../controllers/papelera');
const auth = require('../middleware/authMiddleware');
const soloAdmin = require('../middleware/rol')('administrador');


router.get('/', auth, soloAdmin, papelera.listar);
router.post('/:tipo/:id/restaurar', auth, soloAdmin, papelera.restaurar);
router.delete('/:tipo/:id', auth, soloAdmin, papelera.eliminarDefinitivo);

module.exports = router;
