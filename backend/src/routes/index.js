const { Router } = require('express');

const router = Router();

router.use('/auth', require('./auth.routes'));
router.use('/departamentos', require('./departamento.routes'));
router.use('/tickets', require('./ticket.routes'));
router.use('/usuarios', require('./usuario.routes'));
router.use('/admin', require('./admin.routes'));
router.use('/problemas', require('./problema.routes'));

module.exports = router;
