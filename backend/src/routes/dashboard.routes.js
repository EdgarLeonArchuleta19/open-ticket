const { Router } = require('express');
const { getDashboardStats } = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.get('/stats', authenticate, getDashboardStats);

module.exports = router;
