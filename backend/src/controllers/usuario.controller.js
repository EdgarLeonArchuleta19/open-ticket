const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const TIPOS_VALIDOS = ['administrador', 'tecnico', 'usuarioNormal'];
const SALT_ROUNDS = 10;

const listar = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT u.id, u.username, u.nombre, u.tipo, u.departamento_id, d.nombre AS departamento_nombre
     FROM usuarios u
     LEFT JOIN departamentos d ON u.departamento_id = d.id
     WHERE u.tipo != 'administrador'
     ORDER BY u.nombre ASC`
  );
  res.json(rows);
});

const crear = asyncHandler(async (req, res) => {
  const { username, password, nombre, tipo, departamento_id } = req.body;

  if (!username || !password || !nombre || !tipo) {
    throw new AppError(400, 'Usuario, contraseña, nombre y tipo son obligatorios');
  }
  if (!TIPOS_VALIDOS.includes(tipo)) {
    throw new AppError(400, 'Tipo de usuario inválido');
  }
  if (tipo === 'tecnico' && !departamento_id) {
    throw new AppError(400, 'Un técnico debe tener un departamento asignado');
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const { rows } = await pool.query(
      `INSERT INTO usuarios (username, password, nombre, tipo, departamento_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, nombre, tipo, departamento_id`,
      [username, hash, nombre, tipo, departamento_id || null]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.constraint === 'usuarios_username_key') {
      throw new AppError(400, 'El nombre de usuario ya existe');
    }
    throw error;
  }
});

const actualizar = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { username, password, nombre, tipo, departamento_id } = req.body;

  if (tipo && !TIPOS_VALIDOS.includes(tipo)) {
    throw new AppError(400, 'Tipo de usuario inválido');
  }

  const actual = await pool.query('SELECT password FROM usuarios WHERE id = $1', [id]);
  if (actual.rows.length === 0) {
    throw new AppError(404, 'Usuario no encontrado');
  }

  const nuevoPassword = password && password.trim()
    ? await bcrypt.hash(password, SALT_ROUNDS)
    : actual.rows[0].password;

  try {
    const { rows } = await pool.query(
      `UPDATE usuarios
       SET username = $1, password = $2, nombre = $3, tipo = $4, departamento_id = $5
       WHERE id = $6
       RETURNING id, username, nombre, tipo, departamento_id`,
      [username, nuevoPassword, nombre, tipo, departamento_id || null, id]
    );
    res.json(rows[0]);
  } catch (error) {
    if (error.constraint === 'usuarios_username_key') {
      throw new AppError(400, 'El nombre de usuario ya existe');
    }
    throw error;
  }
});

const eliminar = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    'DELETE FROM usuarios WHERE id = $1 RETURNING id',
    [req.params.id]
  );

  if (rows.length === 0) {
    throw new AppError(404, 'Usuario no encontrado');
  }

  res.json({ message: 'Usuario eliminado correctamente' });
});

module.exports = { listar, crear, actualizar, eliminar };
