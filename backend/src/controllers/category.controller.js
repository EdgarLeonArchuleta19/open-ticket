const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const listCategories = asyncHandler(async (req, res) => {
  const { only_active = 'false' } = req.query;
  const where = only_active === 'true' ? 'WHERE cat.is_active = true' : '';

  const query = `
    SELECT cat.*,
           COUNT(c.id)::int AS causes_count,
           (SELECT COUNT(*)::int FROM tickets t WHERE t.category_id = cat.id) AS tickets_count
    FROM categories cat
    LEFT JOIN causes c ON c.category_id = cat.id AND c.is_active = true
    ${where}
    GROUP BY cat.id
    ORDER BY cat.is_active DESC, cat.name ASC
  `;

  const { rows } = await pool.query(query);
  res.json(rows);
});

const createCategory = asyncHandler(async (req, res) => {
  const { code, name, description } = req.body;
  if (!code || !name) throw new AppError(400, 'Código y nombre son obligatorios');

  const dup = await pool.query('SELECT id FROM categories WHERE LOWER(code) = LOWER($1)', [code.trim()]);
  if (dup.rows.length > 0) throw new AppError(400, `Ya existe una categoría con la clave "${code}"`);

  const { rows } = await pool.query(
    `INSERT INTO categories (code, name, description, is_active)
     VALUES ($1, $2, $3, true)
     RETURNING *`,
    [code.trim().toUpperCase(), name.trim(), description || null]
  );

  res.status(201).json({ message: 'Categoría creada con éxito', category: rows[0] });
});

const updateCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, is_active } = req.body;

  const { rows } = await pool.query(
    `UPDATE categories
     SET name = COALESCE($1, name),
         description = COALESCE($2, description),
         is_active = COALESCE($3, is_active)
     WHERE id = $4
     RETURNING *`,
    [name || null, description !== undefined ? description : null, is_active, id]
  );

  if (rows.length === 0) throw new AppError(404, 'Categoría no encontrada');
  res.json({ message: 'Categoría actualizada con éxito', category: rows[0] });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const tickets = await pool.query('SELECT COUNT(*)::int AS count FROM tickets WHERE category_id = $1', [id]);
  if (tickets.rows[0].count > 0) {
    throw new AppError(400, `No se puede eliminar la categoría porque tiene ${tickets.rows[0].count} tickets asociados. Desactívela.`);
  }

  const causes = await pool.query('SELECT COUNT(*)::int AS count FROM causes WHERE category_id = $1', [id]);
  if (causes.rows[0].count > 0) {
    throw new AppError(400, `La categoría tiene ${causes.rows[0].count} causas vinculadas. Elimine o reasigne las causas primero.`);
  }

  await pool.query('DELETE FROM categories WHERE id = $1', [id]);
  res.json({ message: 'Categoría eliminada con éxito' });
});

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
