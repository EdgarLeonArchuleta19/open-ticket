const { Router } = require('express');
const controller = require('../controllers/admin.controller');
const { listarTodos } = require('../controllers/departamento.controller');
const { authenticate, requireRole } = require('../middleware/auth');

const router = Router();

router.use(authenticate, requireRole('administrador'));

router.get('/tickets', controller.todosLosTickets);
router.get('/tickets/:id', controller.detalleTicket);
router.get('/tickets/:id/historial', controller.historialTicket);
router.get('/departamentos', listarTodos);

module.exports = router;
