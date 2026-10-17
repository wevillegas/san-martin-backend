const express = require('express');
const router = express.Router();
const papelera = require('../controllers/papelera');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, papelera.listar);
router.post('/:tipo/:id/restaurar', auth, papelera.restaurar);
router.delete('/:tipo/:id', auth, papelera.eliminarDefinitivo);

module.exports = router;
