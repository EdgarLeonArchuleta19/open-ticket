const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// Departamentos disponibles para crear tickets (excluye "Problemas").
const listar = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, nombre, descripcion
     FROM departamentos
     WHERE nombre != 'Problemas'
     ORDER BY nombre ASC`
  );
  res.json({ departamentos: rows });
});

// Listado completo (uso administrativo).
const listarTodos = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, nombre, descripcion FROM departamentos ORDER BY nombre ASC`
  );
  res.json(rows);
});

const temas = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, nombre, departamento_id
     FROM temas_departamento
     WHERE departamento_id = $1
     ORDER BY nombre ASC`,
    [req.params.id]
  );
  res.json({ temas: rows });
});

module.exports = { listar, listarTodos, temas };
