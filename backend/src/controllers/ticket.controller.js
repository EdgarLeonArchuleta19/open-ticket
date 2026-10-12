const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

const ESTADOS_VALIDOS = ['abierto', 'en proceso', 'resuelto', 'cerrado'];
const PRIORIDADES_VALIDAS = ['baja', 'media', 'alta'];

// POST /tickets  (usuarioNormal)
const crear = asyncHandler(async (req, res) => {
  const { departamento_id, tema_id, descripcion } = req.body;

  if (!departamento_id || !tema_id || !descripcion || !descripcion.trim()) {
    throw new AppError(400, 'Departamento, tema y descripción son obligatorios');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Técnico del departamento con menos tickets activos.
    const tecnicoResult = await client.query(
      `SELECT u.id, u.nombre
       FROM usuarios u
       LEFT JOIN (
         SELECT tecnico_id, COUNT(*) AS ticket_count
         FROM tickets
         WHERE estado NOT IN ('resuelto', 'cerrado')
         GROUP BY tecnico_id
       ) t ON u.id = t.tecnico_id
       WHERE u.tipo = 'tecnico' AND u.departamento_id = $1
       ORDER BY COALESCE(t.ticket_count, 0) ASC, u.id ASC
       LIMIT 1`,
      [departamento_id]
    );

    if (tecnicoResult.rows.length === 0) {
      throw new AppError(400, 'No hay técnicos disponibles en este departamento');
    }
    const tecnico = tecnicoResult.rows[0];

    const ticketResult = await client.query(
      `INSERT INTO tickets (
         usuario_id, tecnico_id, departamento_id, tema_id,
         descripcion, estado, prioridad, fecha_creacion
       ) VALUES ($1, $2, $3, $4, $5, 'abierto', 'media', CURRENT_TIMESTAMP)
       RETURNING id, fecha_creacion`,
      [req.user.id, tecnico.id, departamento_id, tema_id, descripcion.trim()]
    );

    const ticket = ticketResult.rows[0];

    await client.query(
      `INSERT INTO historial_tickets (ticket_id, tecnico_id, cambio, fecha)
       VALUES ($1, $2, $3, $4)`,
      [
        ticket.id,
        tecnico.id,
        `Ticket creado y asignado automáticamente al agente: ${tecnico.nombre}`,
        ticket.fecha_creacion,
      ]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      ticket_id: ticket.id,
      tecnico_asignado: { id: tecnico.id, nombre: tecnico.nombre },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

// GET /tickets/mios  (usuarioNormal)
const misTickets = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT t.*, d.nombre AS departamento, td.nombre AS tema, u.nombre AS tecnico_nombre
     FROM tickets t
     LEFT JOIN departamentos d ON t.departamento_id = d.id
     LEFT JOIN temas_departamento td ON t.tema_id = td.id
     LEFT JOIN usuarios u ON t.tecnico_id = u.id
     WHERE t.usuario_id = $1
     ORDER BY t.fecha_creacion DESC`,
    [req.user.id]
  );
  res.json({ tickets: rows });
});

// GET /tickets/asignados  (tecnico)
const asignados = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT t.id, t.descripcion, t.estado, t.prioridad, t.fecha_creacion, u.nombre AS cliente
     FROM tickets t
     JOIN usuarios u ON t.usuario_id = u.id
     WHERE t.tecnico_id = $1 AND t.problema_id IS NULL
     ORDER BY t.fecha_creacion DESC`,
    [req.user.id]
  );
  res.json(rows);
});

const obtenerTicket = async (id) => {
  const { rows } = await pool.query(
    `SELECT t.id, t.descripcion, t.estado, t.prioridad, t.fecha_creacion, t.fecha_cierre,
            t.usuario_id, t.tecnico_id,
            uc.nombre AS cliente, uc.username AS cliente_username,
            ut.nombre AS tecnico_nombre,
            d.nombre AS departamento, td.nombre AS tema
     FROM tickets t
     JOIN usuarios uc ON t.usuario_id = uc.id
     LEFT JOIN usuarios ut ON t.tecnico_id = ut.id
     LEFT JOIN departamentos d ON t.departamento_id = d.id
     LEFT JOIN temas_departamento td ON t.tema_id = td.id
     WHERE t.id = $1`,
    [id]
  );
  return rows[0] || null;
};

const verificarAcceso = (ticket, user) => {
  const esAdmin = user.tipo === 'administrador';
  const esDueño = user.id === ticket.usuario_id;
  const esTecnico = user.id === ticket.tecnico_id;
  return esAdmin || esDueño || esTecnico;
};

const obtenerHistorial = async (ticketId) => {
  const { rows } = await pool.query(
    `SELECT h.id, h.cambio, h.fecha, u.nombre AS tecnico_nombre
     FROM historial_tickets h
     LEFT JOIN usuarios u ON h.tecnico_id = u.id
     WHERE h.ticket_id = $1
     ORDER BY h.fecha ASC`,
    [ticketId]
  );
  return rows;
};

// GET /tickets/:id
const detalle = asyncHandler(async (req, res) => {
  const ticket = await obtenerTicket(req.params.id);
  if (!ticket) throw new AppError(404, 'Ticket no encontrado');
  if (!verificarAcceso(ticket, req.user)) {
    throw new AppError(403, 'No tiene permisos para ver este ticket');
  }

  const historial = await obtenerHistorial(ticket.id);

  let tecnico = null;
  if (ticket.tecnico_id) {
    const { rows } = await pool.query(
      'SELECT id, nombre, username FROM usuarios WHERE id = $1',
      [ticket.tecnico_id]
    );
    tecnico = rows[0] || null;
  }

  res.json({ ticket, historial, tecnico });
});

// GET /tickets/:id/historial
const historial = asyncHandler(async (req, res) => {
  const ticket = await obtenerTicket(req.params.id);
  if (!ticket) throw new AppError(404, 'Ticket no encontrado');
  if (!verificarAcceso(ticket, req.user)) {
    throw new AppError(403, 'No tiene permisos para ver este ticket');
  }
  res.json({ historial: await obtenerHistorial(ticket.id) });
});

// PUT /tickets/:id  (tecnico)
const actualizar = asyncHandler(async (req, res) => {
  const { estado, prioridad } = req.body;

  if (!ESTADOS_VALIDOS.includes(estado) || !PRIORIDADES_VALIDAS.includes(prioridad)) {
    throw new AppError(400, 'Estado o prioridad inválidos');
  }

  const ticket = await obtenerTicket(req.params.id);
  if (!ticket) throw new AppError(404, 'Ticket no encontrado');
  if (req.user.tipo !== 'administrador' && req.user.id !== ticket.tecnico_id) {
    throw new AppError(403, 'Solo el técnico asignado puede actualizar este ticket');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `UPDATE tickets SET estado = $1, prioridad = $2 WHERE id = $3 RETURNING *`,
      [estado, prioridad, req.params.id]
    );

    await client.query(
      `INSERT INTO historial_tickets (ticket_id, tecnico_id, cambio)
       VALUES ($1, $2, $3)`,
      [
        req.params.id,
        req.user.id,
        `Actualizó el ticket - Estado: ${estado}, Prioridad: ${prioridad}`,
      ]
    );

    await client.query('COMMIT');
    res.json({ ticket: rows[0] });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

// POST /tickets/:id/responder  (tecnico)
const responder = asyncHandler(async (req, res) => {
  const { respuesta } = req.body;
  if (!respuesta || !respuesta.trim()) {
    throw new AppError(400, 'La respuesta no puede estar vacía');
  }

  const ticket = await obtenerTicket(req.params.id);
  if (!ticket) throw new AppError(404, 'Ticket no encontrado');
  if (req.user.tipo !== 'administrador' && req.user.id !== ticket.tecnico_id) {
    throw new AppError(403, 'Solo el técnico asignado puede responder este ticket');
  }

  const { rows } = await pool.query(
    `INSERT INTO historial_tickets (ticket_id, tecnico_id, cambio)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [req.params.id, req.user.id, respuesta.trim()]
  );

  res.status(201).json({ historial: rows[0] });
});

// POST /tickets/:id/cerrar  (usuarioNormal dueño)
const cerrar = asyncHandler(async (req, res) => {
  const ticket = await obtenerTicket(req.params.id);
  if (!ticket) throw new AppError(404, 'Ticket no encontrado');
  if (req.user.id !== ticket.usuario_id) {
    throw new AppError(403, 'Solo el creador del ticket puede cerrarlo');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE tickets SET estado = 'cerrado', fecha_cierre = CURRENT_TIMESTAMP WHERE id = $1`,
      [req.params.id]
    );

    await client.query(
      `INSERT INTO historial_tickets (ticket_id, cambio)
       VALUES ($1, 'Ticket cerrado por confirmación del cliente')`,
      [req.params.id]
    );

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

// POST /tickets/:id/reabrir  (usuarioNormal dueño)
const reabrir = asyncHandler(async (req, res) => {
  const ticket = await obtenerTicket(req.params.id);
  if (!ticket) throw new AppError(404, 'Ticket no encontrado');
  if (req.user.id !== ticket.usuario_id) {
    throw new AppError(403, 'Solo el creador del ticket puede reabrirlo');
  }

  const motivo = (req.body.motivo || '').trim() || 'Sin motivo especificado';

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `UPDATE tickets SET estado = 'abierto', fecha_cierre = NULL WHERE id = $1`,
      [req.params.id]
    );

    await client.query(
      `INSERT INTO historial_tickets (ticket_id, cambio)
       VALUES ($1, $2)`,
      [req.params.id, `Ticket reabierto por el cliente. Motivo: ${motivo}`]
    );

    await client.query('COMMIT');
    res.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

module.exports = {
  crear,
  misTickets,
  asignados,
  detalle,
  historial,
  actualizar,
  responder,
  cerrar,
  reabrir,
};
