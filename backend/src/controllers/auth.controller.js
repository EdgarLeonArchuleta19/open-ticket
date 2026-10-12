const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { JWT_SECRET } = require('../middleware/auth');

const JWT_EXPIRES = process.env.JWT_EXPIRES || '8h';

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new AppError(400, 'Usuario y contraseña son obligatorios');
  }

  const { rows } = await pool.query(
    `SELECT id, username, password, nombre, tipo, departamento_id
     FROM usuarios
     WHERE username = $1`,
    [username]
  );

  const usuario = rows[0];
  const passwordValido = usuario && (await bcrypt.compare(password, usuario.password));

  if (!passwordValido) {
    throw new AppError(401, 'Credenciales incorrectas');
  }

  const token = jwt.sign(
    {
      id: usuario.id,
      username: usuario.username,
      tipo: usuario.tipo,
      departamento_id: usuario.departamento_id,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES }
  );

  res.json({
    token,
    usuario: {
      id: usuario.id,
      username: usuario.username,
      nombre: usuario.nombre,
      tipo: usuario.tipo,
      departamento_id: usuario.departamento_id,
    },
  });
});

const me = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, username, nombre, tipo, departamento_id FROM usuarios WHERE id = $1`,
    [req.user.id]
  );

  if (rows.length === 0) {
    throw new AppError(404, 'Usuario no encontrado');
  }

  res.json({ usuario: rows[0] });
});

module.exports = { login, me };
