const { Router } = require('express');
const {
  listNotifications,
  markAsRead,
  markAllAsRead,
} = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.get('/', listNotifications);
router.put('/:id/read', markAsRead);
router.put('/read-all', markAllAsRead);

module.exports = router;
