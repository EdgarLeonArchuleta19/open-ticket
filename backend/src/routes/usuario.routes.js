const { Router } = require('express');
const controller = require('../controllers/usuario.controller');
const { authenticate, requireRole } = require('../middleware/auth');

const router = Router();

router.use(authenticate, requireRole('administrador'));

router.get('/', controller.listar);
router.post('/', controller.crear);
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);

module.exports = router;
