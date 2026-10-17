const express = require('express');
const router = express.Router();
const autoridades = require('../controllers/autoridadController');
const auth = require('../middleware/authMiddleware');

router.get('/', autoridades.obtener);
router.post('/', auth, autoridades.crear);
router.post('/importar', auth, autoridades.importar);
router.put('/orden', auth, autoridades.reordenar); // antes que /:id
router.put('/:id', auth, autoridades.actualizar);
router.delete('/:id', auth, autoridades.eliminar);

module.exports = router;
