const { Router } = require('express');
const controller = require('../controllers/ticket.controller');
const { authenticate, requireRole } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

// Rutas específicas antes de "/:id"
router.post('/', requireRole('usuarioNormal'), controller.crear);
router.get('/mios', requireRole('usuarioNormal'), controller.misTickets);
router.get('/asignados', requireRole('tecnico'), controller.asignados);

router.get('/:id', controller.detalle);
router.get('/:id/historial', controller.historial);
router.put('/:id', requireRole('tecnico'), controller.actualizar);
router.post('/:id/responder', requireRole('tecnico'), controller.responder);
router.post('/:id/cerrar', requireRole('usuarioNormal'), controller.cerrar);
router.post('/:id/reabrir', requireRole('usuarioNormal'), controller.reabrir);

module.exports = router;
