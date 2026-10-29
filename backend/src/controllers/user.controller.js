const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const listUsers = asyncHandler(async (req, res) => {
  const { role, department_id, search = '' } = req.query;

  const conditions = [];
  const params = [];

  if (role) {
    params.push(role);
    conditions.push(`u.role = $${params.length}`);
  }

  if (department_id) {
    params.push(Number(department_id));
    conditions.push(`u.department_id = $${params.length}`);
  }

  if (search.trim()) {
    params.push(`%${search.trim().toLowerCase()}%`);
    const p = params.length;
    conditions.push(`(LOWER(u.username) LIKE $${p} OR LOWER(u.full_name) LIKE $${p} OR LOWER(u.email) LIKE $${p})`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT u.id, u.username, u.email, u.full_name, u.role, u.department_id, u.is_active, u.created_at,
           d.name AS department_name, d.code AS department_code,
           (SELECT COUNT(*)::int FROM tickets t WHERE t.assigned_to = u.id AND t.status NOT IN ('cerrado', 'cancelado')) AS active_assigned_tickets,
           (SELECT COUNT(*)::int FROM tickets t WHERE t.requester_id = u.id) AS requested_tickets_count
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.id
    ${where}
    ORDER BY u.is_active DESC, u.full_name ASC
  `;

  const { rows } = await pool.query(query, params);
  res.json(rows);
});

const createUser = asyncHandler(async (req, res) => {
  const { username, email, password, full_name, role = 'requester', department_id } = req.body;

  if (!username || !email || !password || !full_name) {
    throw new AppError(400, 'Nombre completo, usuario, correo y contraseña son obligatorios');
  }

  if (!['admin', 'agent', 'requester'].includes(role)) {
    throw new AppError(400, 'Rol inválido');
  }

  // Verificar duplicados
  const dup = await pool.query(
    'SELECT id FROM users WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($2)',
    [username.trim(), email.trim()]
  );
  if (dup.rows.length > 0) {
    throw new AppError(400, 'El nombre de usuario o correo ya se encuentra registrado');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { rows } = await pool.query(
    `INSERT INTO users (username, email, password, full_name, role, department_id, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, true)
     RETURNING id, username, email, full_name, role, department_id, is_active, created_at`,
    [username.trim(), email.trim(), hashedPassword, full_name.trim(), role, department_id ? Number(department_id) : null]
  );

  res.status(201).json({
    message: 'Usuario creado exitosamente',
    user: rows[0],
  });
});

const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { email, full_name, role, department_id, is_active, password } = req.body;

  const cur = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  if (cur.rows.length === 0) throw new AppError(404, 'Usuario no encontrado');
  const user = cur.rows[0];

  let newPassHash = user.password;
  if (password && password.trim().length >= 6) {
    newPassHash = await bcrypt.hash(password.trim(), 10);
  }

  const { rows } = await pool.query(
    `UPDATE users
     SET email = COALESCE($1, email),
         full_name = COALESCE($2, full_name),
         role = COALESCE($3, role),
         department_id = $4,
         is_active = COALESCE($5, is_active),
         password = $6,
         updated_at = NOW()
     WHERE id = $7
     RETURNING id, username, email, full_name, role, department_id, is_active, updated_at`,
    [email || null, full_name || null, role || null, department_id ? Number(department_id) : null, is_active, newPassHash, id]
  );

  res.json({
    message: 'Usuario actualizado exitosamente',
    user: rows[0],
  });
});

const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Si tiene tickets o comentarios, desactivar en vez de borrar para mantener integridad
  const check = await pool.query(
    'SELECT (SELECT COUNT(*) FROM tickets WHERE requester_id = $1 OR assigned_to = $1) + (SELECT COUNT(*) FROM ticket_comments WHERE user_id = $1) AS total',
    [id]
  );

  if (Number(check.rows[0].total) > 0) {
    await pool.query('UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1', [id]);
    return res.json({ message: 'El usuario tiene actividad histórica asociada, por lo que ha sido desactivado en lugar de eliminado.' });
  }

  await pool.query('DELETE FROM users WHERE id = $1', [id]);
  res.json({ message: 'Usuario eliminado correctamente' });
});

module.exports = { listUsers, createUser, updateUser, deleteUser };
