const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const listNotifications = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT n.*, t.folio AS ticket_folio
     FROM notifications n
     LEFT JOIN tickets t ON n.ticket_id = t.id
     WHERE n.user_id = $1
     ORDER BY n.created_at DESC
     LIMIT 20`,
    [req.user.id]
  );

  const countRes = await pool.query(
    'SELECT COUNT(*)::int AS unread FROM notifications WHERE user_id = $1 AND is_read = false',
    [req.user.id]
  );

  res.json({
    notifications: rows,
    unread_count: countRes.rows[0]?.unread || 0,
  });
});

const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await pool.query('UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2', [id, req.user.id]);
  res.json({ success: true });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await pool.query('UPDATE notifications SET is_read = true WHERE user_id = $1', [req.user.id]);
  res.json({ success: true });
});

module.exports = { listNotifications, markAsRead, markAllAsRead };
