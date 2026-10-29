const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { JWT_SECRET } = require('../middleware/auth');

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new AppError(400, 'Debe proporcionar usuario y contraseña');
  }

  const { rows } = await pool.query(
    `SELECT u.*, d.name AS department_name
     FROM users u
     LEFT JOIN departments d ON u.department_id = d.id
     WHERE LOWER(u.username) = LOWER($1) OR LOWER(u.email) = LOWER($1)`,
    [username.trim()]
  );

  if (rows.length === 0) {
    throw new AppError(401, 'Credenciales incorrectas');
  }

  const user = rows[0];

  if (!user.is_active) {
    throw new AppError(403, 'Esta cuenta ha sido desactivada. Contacte al administrador');
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw new AppError(401, 'Credenciales incorrectas');
  }

  const tokenPayload = {
    id: user.id,
    username: user.username,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    department_id: user.department_id,
  };

  const token = jwt.sign(tokenPayload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || '8h',
  });

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      department_id: user.department_id,
      department_name: user.department_name,
    },
  });
});

const me = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT u.id, u.username, u.email, u.full_name, u.role, u.department_id, u.is_active,
            d.name AS department_name,
            (SELECT COUNT(*) FROM notifications n WHERE n.user_id = u.id AND n.is_read = false) AS unread_notifications
     FROM users u
     LEFT JOIN departments d ON u.department_id = d.id
     WHERE u.id = $1`,
    [req.user.id]
  );

  if (rows.length === 0) {
    throw new AppError(404, 'Usuario no encontrado');
  }

  res.json(rows[0]);
});

const updateProfile = asyncHandler(async (req, res) => {
  const { full_name, email, current_password, new_password } = req.body;

  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
  if (rows.length === 0) throw new AppError(404, 'Usuario no encontrado');
  const user = rows[0];

  let newHash = user.password;
  if (new_password) {
    if (!current_password) {
      throw new AppError(400, 'Debe ingresar su contraseña actual para cambiarla');
    }
    const match = await bcrypt.compare(current_password, user.password);
    if (!match) {
      throw new AppError(400, 'La contraseña actual no coincide');
    }
    if (new_password.length < 6) {
      throw new AppError(400, 'La nueva contraseña debe tener al menos 6 caracteres');
    }
    newHash = await bcrypt.hash(new_password, 10);
  }

  const updated = await pool.query(
    `UPDATE users
     SET full_name = COALESCE($1, full_name),
         email = COALESCE($2, email),
         password = $3,
         updated_at = NOW()
     WHERE id = $4
     RETURNING id, username, email, full_name, role, department_id`,
    [full_name || null, email || null, newHash, req.user.id]
  );

  res.json({
    message: 'Perfil actualizado correctamente',
    user: updated.rows[0],
  });
});

module.exports = { login, me, updateProfile };
