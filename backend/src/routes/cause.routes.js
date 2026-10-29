const { Router } = require('express');
const {
  listCauses,
  createCause,
  updateCause,
  deleteCause,
} = require('../controllers/cause.controller');
const { authenticate, requireRole } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.get('/', listCauses);
router.post('/', requireRole('admin'), createCause);
router.put('/:id', requireRole('admin'), updateCause);
router.delete('/:id', requireRole('admin'), deleteCause);

module.exports = router;
