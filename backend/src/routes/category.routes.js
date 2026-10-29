const { Router } = require('express');
const {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/category.controller');
const { authenticate, requireRole } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.get('/', listCategories);
router.post('/', requireRole('admin'), createCategory);
router.put('/:id', requireRole('admin'), updateCategory);
router.delete('/:id', requireRole('admin'), deleteCategory);

module.exports = router;
