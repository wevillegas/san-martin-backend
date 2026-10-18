const express = require('express');
const router = express.Router();
const propio = require('../middleware/propio');
const ocultarCreador = require('../middleware/ocultarCreador');
const authOpcional = require('../middleware/authOpcional');
const Autoridad = require('../models/Autoridad');
const autoridades = require('../controllers/autoridadController');
const auth = require('../middleware/authMiddleware');
const soloAdmin = require('../middleware/rol')('administrador');


router.get('/', authOpcional, ocultarCreador, autoridades.obtener);
router.post('/', auth, autoridades.crear);
router.post('/importar', auth, soloAdmin, autoridades.importar);
router.put('/orden', auth, autoridades.reordenar); // antes que /:id
router.put('/:id', auth, propio(Autoridad), autoridades.actualizar);
router.delete('/:id', auth, propio(Autoridad), autoridades.eliminar);

module.exports = router;
