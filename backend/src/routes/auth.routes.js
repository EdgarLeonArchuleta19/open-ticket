const { Router } = require('express');
const { login, me, updateProfile } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.post('/login', login);
router.get('/me', authenticate, me);
router.put('/profile', authenticate, updateProfile);

module.exports = router;
