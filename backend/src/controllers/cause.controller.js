const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const listCauses = asyncHandler(async (req, res) => {
  const { category_id, only_active = 'false' } = req.query;

  const conditions = [];
  const params = [];

  if (category_id) {
    params.push(Number(category_id));
    conditions.push(`c.category_id = $${params.length}`);
  }

  if (only_active === 'true') {
    conditions.push('c.is_active = true');
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const query = `
    SELECT c.*,
           cat.name AS category_name, cat.code AS category_code,
           (SELECT COUNT(*)::int FROM tickets t WHERE t.cause_id = c.id) AS tickets_count
    FROM causes c
    JOIN categories cat ON c.category_id = cat.id
    ${where}
    ORDER BY c.is_active DESC, c.name ASC
  `;

  const { rows } = await pool.query(query, params);
  res.json(rows);
});

const createCause = asyncHandler(async (req, res) => {
  const { code, name, description, category_id, default_priority = 'media' } = req.body;
  if (!code || !name || !category_id) {
    throw new AppError(400, 'Código, nombre y categoría son campos obligatorios');
  }

  const validPriorities = ['baja', 'media', 'alta', 'critica'];
  const priority = validPriorities.includes(default_priority) ? default_priority : 'media';

  const dup = await pool.query('SELECT id FROM causes WHERE LOWER(code) = LOWER($1)', [code.trim()]);
  if (dup.rows.length > 0) throw new AppError(400, `Ya existe una causa con la clave "${code}"`);

  const { rows } = await pool.query(
    `INSERT INTO causes (code, name, description, category_id, default_priority, is_active)
     VALUES ($1, $2, $3, $4, $5, true)
     RETURNING *`,
    [code.trim().toUpperCase(), name.trim(), description || null, Number(category_id), priority]
  );

  res.status(201).json({ message: 'Causa creada con éxito', cause: rows[0] });
});

const updateCause = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, category_id, default_priority, is_active } = req.body;

  const validPriorities = ['baja', 'media', 'alta', 'critica'];
  const priority = default_priority && validPriorities.includes(default_priority) ? default_priority : null;

  const { rows } = await pool.query(
    `UPDATE causes
     SET name = COALESCE($1, name),
         description = COALESCE($2, description),
         category_id = COALESCE($3, category_id),
         default_priority = COALESCE($4, default_priority),
         is_active = COALESCE($5, is_active)
     WHERE id = $6
     RETURNING *`,
    [name || null, description !== undefined ? description : null, category_id ? Number(category_id) : null, priority, is_active, id]
  );

  if (rows.length === 0) throw new AppError(404, 'Causa no encontrada');
  res.json({ message: 'Causa actualizada con éxito', cause: rows[0] });
});

const deleteCause = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const tickets = await pool.query('SELECT COUNT(*)::int AS count FROM tickets WHERE cause_id = $1', [id]);
  if (tickets.rows[0].count > 0) {
    throw new AppError(400, `No se puede eliminar la causa porque tiene ${tickets.rows[0].count} tickets asociados. Desactívela en su lugar.`);
  }

  await pool.query('DELETE FROM causes WHERE id = $1', [id]);
  res.json({ message: 'Causa eliminada con éxito' });
});

module.exports = { listCauses, createCause, updateCause, deleteCause };
