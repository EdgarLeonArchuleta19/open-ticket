const { Router } = require('express');
const controller = require('../controllers/problema.controller');
const { authenticate, requireRole } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.get('/', controller.listar);
router.post('/', requireRole('tecnico'), controller.crear);
router.get('/:id', controller.detalle);
router.post('/:id/resolver', requireRole('tecnico'), controller.resolver);

module.exports = router;
