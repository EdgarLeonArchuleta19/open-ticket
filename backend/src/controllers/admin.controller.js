const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// GET /admin/tickets
const todosLosTickets = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(`
    SELECT
      t.*,
      json_build_object('id', u_creador.id, 'nombre', u_creador.nombre) AS usuario,
      json_build_object('id', u_tecnico.id, 'nombre', u_tecnico.nombre) AS tecnico,
      json_build_object('id', d.id, 'nombre', d.nombre) AS departamento,
      json_build_object('id', td.id, 'nombre', td.nombre) AS tema
    FROM tickets t
    JOIN usuarios u_creador ON t.usuario_id = u_creador.id
    LEFT JOIN usuarios u_tecnico ON t.tecnico_id = u_tecnico.id
    JOIN departamentos d ON t.departamento_id = d.id
    JOIN temas_departamento td ON t.tema_id = td.id
    ORDER BY t.fecha_creacion DESC
  `);

  res.json(rows);
});

// GET /admin/tickets/:id
const detalleTicket = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT
       t.id, t.descripcion, t.prioridad, t.estado, t.fecha_creacion, t.fecha_cierre,
       json_build_object('id', u_creador.id, 'nombre', u_creador.nombre) AS usuario,
       json_build_object('id', u_tecnico.id, 'nombre', u_tecnico.nombre) AS tecnico,
       json_build_object('id', d.id, 'nombre', d.nombre) AS departamento,
       json_build_object('id', td.id, 'nombre', td.nombre) AS tema
     FROM tickets t
     JOIN usuarios u_creador ON t.usuario_id = u_creador.id
     LEFT JOIN usuarios u_tecnico ON t.tecnico_id = u_tecnico.id
     JOIN departamentos d ON t.departamento_id = d.id
     JOIN temas_departamento td ON t.tema_id = td.id
     WHERE t.id = $1`,
    [req.params.id]
  );

  if (rows.length === 0) {
    throw new AppError(404, 'Ticket no encontrado');
  }

  res.json(rows[0]);
});

// GET /admin/tickets/:id/historial
const historialTicket = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT
       h.id,
       h.cambio,
       h.fecha,
       json_build_object('id', u.id, 'nombre', u.nombre) AS tecnico
     FROM historial_tickets h
     LEFT JOIN usuarios u ON h.tecnico_id = u.id
     WHERE h.ticket_id = $1
     ORDER BY h.fecha DESC`,
    [req.params.id]
  );

  res.json(rows);
});

module.exports = { todosLosTickets, detalleTicket, historialTicket };
