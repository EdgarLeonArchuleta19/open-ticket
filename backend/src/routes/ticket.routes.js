const { Router } = require('express');
const {
  listTickets,
  getTicketById,
  createTicket,
  updateTicket,
  addComment,
  resolveTicket,
  closeTicket,
  reopenTicket,
} = require('../controllers/ticket.controller');
const { authenticate, requireRole } = require('../middleware/auth');

const router = Router();

router.use(authenticate);

router.get('/', listTickets);
router.post('/', createTicket);
router.get('/:id', getTicketById);
router.put('/:id', updateTicket);
router.post('/:id/comments', addComment);
router.post('/:id/resolve', requireRole('admin', 'agent'), resolveTicket);
router.post('/:id/close', closeTicket);
router.post('/:id/reopen', reopenTicket);

module.exports = router;
