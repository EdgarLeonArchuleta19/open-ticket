const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// POST /problemas  (tecnico)
const crear = asyncHandler(async (req, res) => {
  const { titulo, descripcion, ticketsRelacionados } = req.body;

  if (!titulo || !titulo.trim()) {
    throw new AppError(400, 'El título es obligatorio');
  }

  const tickets = Array.isArray(ticketsRelacionados) ? ticketsRelacionados : [];

  const { rows } = await pool.query(
    'SELECT crear_problema_y_actualizar_tickets($1, $2, $3) AS problema_id',
    [titulo.trim(), descripcion || null, tickets]
  );

  res.status(201).json({
    success: true,
    mensaje: 'Problema creado exitosamente',
    problemaId: rows[0].problema_id,
  });
});

// GET /problemas
const listar = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(`
    SELECT
      p.id,
      p.titulo,
      p.estado,
      p.fecha_creacion,
      u.nombre AS tecnico_nombre
    FROM problemas p
    LEFT JOIN usuarios u ON p.tecnico_asignado = u.id
    ORDER BY p.fecha_creacion DESC
  `);
  res.json(rows);
});

// GET /problemas/:id
const detalle = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT p.*, u.nombre AS tecnico_nombre
     FROM problemas p
     LEFT JOIN usuarios u ON p.tecnico_asignado = u.id
     WHERE p.id = $1`,
    [req.params.id]
  );

  if (rows.length === 0) {
    throw new AppError(404, 'Problema no encontrado');
  }

  const problema = rows[0];
  const tickets = await pool.query(
    `SELECT id, descripcion, estado FROM tickets WHERE problema_id = $1`,
    [req.params.id]
  );
  problema.tickets = tickets.rows;

  res.json(problema);
});

// POST /problemas/:id/resolver  (tecnico)
const resolver = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { solucion } = req.body;

  if (!solucion || !solucion.trim()) {
    throw new AppError(400, 'La solución es obligatoria');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const problema = await client.query(
      `SELECT id FROM problemas WHERE id = $1 AND estado != 'Resuelto'`,
      [id]
    );
    if (problema.rows.length === 0) {
      throw new AppError(404, 'Problema no encontrado o ya está resuelto');
    }

    await client.query(
      `UPDATE problemas SET estado = 'Resuelto', solucion = $1 WHERE id = $2`,
      [solucion.trim(), id]
    );

    const ticketsAfectados = await client.query(
      `UPDATE tickets
       SET estado = 'resuelto', fecha_cierre = CURRENT_TIMESTAMP
       WHERE problema_id = $1
       RETURNING id`,
      [id]
    );

    if (ticketsAfectados.rows.length > 0) {
      await client.query(
        `INSERT INTO historial_tickets (ticket_id, tecnico_id, cambio, fecha)
         SELECT t.id, $1::INTEGER,
                'Ticket resuelto como parte del problema #' || $2 || ': ' || $3,
                CURRENT_TIMESTAMP
         FROM tickets t
         WHERE t.problema_id = $2::INTEGER`,
        [req.user.id, id, solucion.trim()]
      );
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      mensaje: 'Problema resuelto exitosamente',
      ticketsResueltos: ticketsAfectados.rows.length,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

module.exports = { crear, listar, detalle, resolver };
