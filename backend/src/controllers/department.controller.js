const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// Listar departamentos con conteo de tickets y responsable
const listDepartments = asyncHandler(async (req, res) => {
  const { search = '', only_active = 'false' } = req.query;

  const conditions = [];
  const params = [];

  if (only_active === 'true') {
    conditions.push('d.is_active = true');
  }

  if (search.trim()) {
    params.push(`%${search.trim().toLowerCase()}%`);
    conditions.push(`(LOWER(d.name) LIKE $${params.length} OR LOWER(d.code) LIKE $${params.length})`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT d.*,
           u.full_name AS manager_name,
           (SELECT COUNT(*)::int FROM tickets t WHERE t.target_department_id = d.id AND t.status NOT IN ('cerrado', 'cancelado')) AS active_tickets_count
    FROM departments d
    LEFT JOIN users u ON d.manager_id = u.id
    ${where}
    ORDER BY d.is_active DESC, d.name ASC
  `;

  const { rows } = await pool.query(query, params);
  res.json(rows);
});

// Crear departamento
const createDepartment = asyncHandler(async (req, res) => {
  const { code, name, description, manager_id } = req.body;

  if (!code || !name) {
    throw new AppError(400, 'El código y nombre del departamento son obligatorios');
  }

  const dup = await pool.query('SELECT id FROM departments WHERE LOWER(code) = LOWER($1)', [code.trim()]);
  if (dup.rows.length > 0) {
    throw new AppError(400, `Ya existe un departamento con la clave "${code}"`);
  }

  const insert = await pool.query(
    `INSERT INTO departments (code, name, description, manager_id, is_active)
     VALUES ($1, $2, $3, $4, true)
     RETURNING *`,
    [code.trim().toUpperCase(), name.trim(), description || null, manager_id ? Number(manager_id) : null]
  );

  res.status(201).json({
    message: 'Departamento creado exitosamente',
    department: insert.rows[0],
  });
});

// Actualizar departamento
const updateDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, manager_id, is_active } = req.body;

  const cur = await pool.query('SELECT * FROM departments WHERE id = $1', [id]);
  if (cur.rows.length === 0) throw new AppError(404, 'Departamento no encontrado');

  const update = await pool.query(
    `UPDATE departments
     SET name = COALESCE($1, name),
         description = COALESCE($2, description),
         manager_id = $3,
         is_active = COALESCE($4, is_active),
         updated_at = NOW()
     WHERE id = $5
     RETURNING *`,
    [name || null, description !== undefined ? description : null, manager_id ? Number(manager_id) : null, is_active, id]
  );

  res.json({
    message: 'Departamento actualizado con éxito',
    department: update.rows[0],
  });
});

// Eliminar departamento (validando dependencias)
const deleteDepartment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const tickets = await pool.query(
    'SELECT COUNT(*)::int AS count FROM tickets WHERE target_department_id = $1 OR requesting_department_id = $1',
    [id]
  );

  if (tickets.rows[0].count > 0) {
    throw new AppError(400, `No se puede eliminar físicamente este departamento porque tiene ${tickets.rows[0].count} tickets asociados. Desactívelo en su lugar.`);
  }

  await pool.query('DELETE FROM departments WHERE id = $1', [id]);
  res.json({ message: 'Departamento eliminado correctamente' });
});

module.exports = { listDepartments, createDepartment, updateDepartment, deleteDepartment };
