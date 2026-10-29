const { Router } = require('express');
const {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/user.controller');
const { authenticate, requireRole } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.get('/', listUsers);
router.post('/', requireRole('admin'), createUser);
router.put('/:id', requireRole('admin'), updateUser);
router.delete('/:id', requireRole('admin'), deleteUser);

module.exports = router;
