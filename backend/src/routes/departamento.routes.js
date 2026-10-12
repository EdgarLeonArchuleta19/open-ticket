const { Router } = require('express');
const { listar, temas } = require('../controllers/departamento.controller');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.get('/', listar);
router.get('/:id/temas', temas);

module.exports = router;
