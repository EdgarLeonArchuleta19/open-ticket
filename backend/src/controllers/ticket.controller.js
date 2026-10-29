const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

// Listado con filtros y paginación
const listTickets = asyncHandler(async (req, res) => {
  const user = req.user;
  const {
    page = 1,
    limit = 10,
    search = '',
    status = '',
    priority = '',
    department_id = '',
    category_id = '',
    cause_id = '',
    assigned_to = '',
    requester_id = '',
    sort_by = 'created_at',
    sort_dir = 'DESC',
  } = req.query;

  const offset = (Number(page) - 1) * Number(limit);
  const conditions = [];
  const params = [];

  // Regla de negocio por rol
  if (user.role === 'requester') {
    params.push(user.id);
    conditions.push(`t.requester_id = $${params.length}`);
  } else if (requester_id) {
    params.push(Number(requester_id));
    conditions.push(`t.requester_id = $${params.length}`);
  }

  if (search.trim()) {
    params.push(`%${search.trim().toLowerCase()}%`);
    const pIndex = params.length;
    conditions.push(`(
      LOWER(t.folio) LIKE $${pIndex} OR
      LOWER(t.title) LIKE $${pIndex} OR
      LOWER(t.description) LIKE $${pIndex} OR
      LOWER(u.full_name) LIKE $${pIndex}
    )`);
  }

  if (status) {
    params.push(status);
    conditions.push(`t.status = $${params.length}`);
  }

  if (priority) {
    params.push(priority);
    conditions.push(`t.priority = $${params.length}`);
  }

  if (department_id) {
    params.push(Number(department_id));
    conditions.push(`t.target_department_id = $${params.length}`);
  }

  if (category_id) {
    params.push(Number(category_id));
    conditions.push(`t.category_id = $${params.length}`);
  }

  if (cause_id) {
    params.push(Number(cause_id));
    conditions.push(`t.cause_id = $${params.length}`);
  }

  if (assigned_to) {
    if (assigned_to === 'unassigned') {
      conditions.push('t.assigned_to IS NULL');
    } else {
      params.push(Number(assigned_to));
      conditions.push(`t.assigned_to = $${params.length}`);
    }
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const validSortCols = ['created_at', 'updated_at', 'priority', 'status', 'folio', 'title'];
  const sortCol = validSortCols.includes(sort_by) ? `t.${sort_by}` : 't.created_at';
  const sortOrder = sort_dir.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  // Conteo total
  const countQuery = `
    SELECT COUNT(*)::int AS total
    FROM tickets t
    JOIN users u ON t.requester_id = u.id
    ${whereClause}
  `;
  const countRes = await pool.query(countQuery, params);
  const total = countRes.rows[0]?.total || 0;

  // Consulta paginada
  const dataQuery = `
    SELECT t.id, t.folio, t.title, t.priority, t.status, t.due_date, t.resolution_date, t.created_at, t.updated_at,
           u.id AS requester_id, u.full_name AS requester_name, u.email AS requester_email,
           d_req.name AS requesting_department,
           d_tgt.id AS target_department_id, d_tgt.name AS target_department,
           cat.id AS category_id, cat.name AS category_name,
           cau.id AS cause_id, cau.name AS cause_name,
           ag.id AS assigned_to_id, ag.full_name AS assigned_to_name
    FROM tickets t
    JOIN users u ON t.requester_id = u.id
    LEFT JOIN departments d_req ON t.requesting_department_id = d_req.id
    JOIN departments d_tgt ON t.target_department_id = d_tgt.id
    JOIN categories cat ON t.category_id = cat.id
    JOIN causes cau ON t.cause_id = cau.id
    LEFT JOIN users ag ON t.assigned_to = ag.id
    ${whereClause}
    ORDER BY ${sortCol} ${sortOrder}
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;

  const dataRes = await pool.query(dataQuery, [...params, Number(limit), offset]);

  res.json({
    tickets: dataRes.rows,
    total,
    page: Number(page),
    limit: Number(limit),
    totalPages: Math.max(1, Math.ceil(total / Number(limit))),
  });
});

// Detalle completo del ticket
const getTicketById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  // Buscar por ID numérico o Folio
  const isFolio = id.startsWith('TKT-');
  const ticketQuery = `
    SELECT t.*,
           u.id AS requester_id, u.full_name AS requester_name, u.email AS requester_email, u.username AS requester_username,
           d_req.name AS requesting_department,
           d_tgt.name AS target_department,
           cat.name AS category_name,
           cau.name AS cause_name,
           ag.id AS assigned_to_id, ag.full_name AS assigned_to_name, ag.email AS assigned_to_email
    FROM tickets t
    JOIN users u ON t.requester_id = u.id
    LEFT JOIN departments d_req ON t.requesting_department_id = d_req.id
    JOIN departments d_tgt ON t.target_department_id = d_tgt.id
    JOIN categories cat ON t.category_id = cat.id
    JOIN causes cau ON t.cause_id = cau.id
    LEFT JOIN users ag ON t.assigned_to = ag.id
    WHERE ${isFolio ? 't.folio = $1' : 't.id = $1'}
  `;

  const ticketRes = await pool.query(ticketQuery, [id]);
  if (ticketRes.rows.length === 0) {
    throw new AppError(404, 'Ticket no encontrado');
  }

  const ticket = ticketRes.rows[0];

  // Control de acceso: el solicitante solo puede ver sus propios tickets
  if (user.role === 'requester' && ticket.requester_id !== user.id) {
    throw new AppError(403, 'No tiene autorización para consultar este ticket');
  }

  // Comentarios: Las notas internas son estrictamente excluidas para solicitantes
  const isRequester = user.role === 'requester';
  const commentsQuery = `
    SELECT c.id, c.content, c.is_internal, c.created_at,
           u.id AS user_id, u.full_name AS user_name, u.role AS user_role
    FROM ticket_comments c
    JOIN users u ON c.user_id = u.id
    WHERE c.ticket_id = $1 ${isRequester ? 'AND c.is_internal = false' : ''}
    ORDER BY c.created_at ASC
  `;
  const commentsRes = await pool.query(commentsQuery, [ticket.id]);

  // Historial de auditoría
  const historyQuery = `
    SELECT h.id, h.event_type, h.description, h.metadata, h.created_at,
           u.full_name AS user_name, u.role AS user_role
    FROM ticket_history h
    LEFT JOIN users u ON h.user_id = u.id
    WHERE h.ticket_id = $1
    ORDER BY h.created_at ASC
  `;
  const historyRes = await pool.query(historyQuery, [ticket.id]);

  res.json({
    ticket,
    comments: commentsRes.rows,
    history: historyRes.rows,
  });
});

// Crear ticket con generación de folio transaccional
const createTicket = asyncHandler(async (req, res) => {
  const user = req.user;
  const {
    title,
    description,
    target_department_id,
    category_id,
    cause_id,
    priority = 'media',
    due_date,
    assigned_to,
  } = req.body;

  if (!title || !description || !target_department_id || !category_id || !cause_id) {
    throw new AppError(400, 'Todos los campos obligatorios deben ser completados');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Validar departamento destino activo
    const deptCheck = await client.query('SELECT id, name, is_active FROM departments WHERE id = $1', [target_department_id]);
    if (deptCheck.rows.length === 0 || !deptCheck.rows[0].is_active) {
      throw new AppError(400, 'El departamento seleccionado no está activo o no existe');
    }

    // Validar categoría y causa compatibles y obtener prioridad definida por el administrador
    const causeCheck = await client.query(
      `SELECT c.id, c.is_active, c.default_priority, cat.is_active AS cat_active
       FROM causes c
       JOIN categories cat ON c.category_id = cat.id
       WHERE c.id = $1 AND c.category_id = $2`,
      [cause_id, category_id]
    );
    if (causeCheck.rows.length === 0 || !causeCheck.rows[0].is_active || !causeCheck.rows[0].cat_active) {
      throw new AppError(400, 'La causa seleccionada no es válida para la categoría elegida');
    }

    const causeData = causeCheck.rows[0];

    // Folio único
    const folioRes = await client.query("SELECT 'TKT-' || LPAD(NEXTVAL('ticket_folio_seq')::TEXT, 6, '0') AS folio");
    const folio = folioRes.rows[0].folio;

    const requesterDept = user.department_id || target_department_id;
    const initialStatus = 'nuevo';
    const validPriorities = ['baja', 'media', 'alta', 'critica'];
    // La prioridad la rige la causa definida por el administrador en el catálogo
    const chosenPriority = causeData.default_priority || (validPriorities.includes(priority) ? priority : 'media');

    // Inserción de ticket
    const insertQuery = `
      INSERT INTO tickets (
        folio, title, description, requester_id, requesting_department_id,
        target_department_id, category_id, cause_id, priority, status,
        assigned_to, due_date
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const insertRes = await client.query(insertQuery, [
      folio,
      title.trim(),
      description.trim(),
      user.id,
      requesterDept,
      target_department_id,
      category_id,
      cause_id,
      chosenPriority,
      initialStatus,
      assigned_to || null,
      due_date || null,
    ]);

    const newTicket = insertRes.rows[0];

    // Historial
    await client.query(
      `INSERT INTO ticket_history (ticket_id, user_id, event_type, description, metadata)
       VALUES ($1, $2, 'creacion', $3, $4)`,
      [
        newTicket.id,
        user.id,
        `Ticket creado con folio ${folio}`,
        JSON.stringify({ priority: chosenPriority, status: initialStatus }),
      ]
    );

    // Notificaciones: al asignado y a los agentes/admins del departamento
    if (assigned_to) {
      await client.query(
        `INSERT INTO notifications (user_id, ticket_id, title, message)
         VALUES ($1, $2, 'Nuevo ticket asignado', $3)`,
        [assigned_to, newTicket.id, `Se te ha asignado el ticket ${folio}: ${title}`]
      );
    }

    // Notificar a agentes del departamento destino y administradores
    if (assigned_to) {
      await client.query(
        `INSERT INTO notifications (user_id, ticket_id, title, message)
         SELECT u.id, $1, 'Nuevo ticket recibido', $2
         FROM users u
         WHERE u.is_active = true
           AND u.id != $3
           AND u.id != $4
           AND (
             (u.role = 'agent' AND u.department_id = $5)
             OR u.role = 'admin'
           )`,
        [newTicket.id, `Nuevo ticket ${folio} en tu departamento: "${title}"`, user.id, Number(assigned_to), target_department_id]
      );
    } else {
      await client.query(
        `INSERT INTO notifications (user_id, ticket_id, title, message)
         SELECT u.id, $1, 'Nuevo ticket recibido', $2
         FROM users u
         WHERE u.is_active = true
           AND u.id != $3
           AND (
             (u.role = 'agent' AND u.department_id = $4)
             OR u.role = 'admin'
           )`,
        [newTicket.id, `Nuevo ticket ${folio} registrado: "${title}"`, user.id, target_department_id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json({
      message: 'Ticket registrado con éxito',
      ticket: newTicket,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

// Actualizar ticket (estado, prioridad, responsable, departamento) con control de concurrencia
const updateTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const { status, priority, assigned_to, target_department_id, due_date, expected_updated_at } = req.body;

  // Requesters no pueden cambiar asignación ni prioridad
  if (user.role === 'requester' && (assigned_to !== undefined || priority !== undefined || target_department_id !== undefined)) {
    throw new AppError(403, 'Los solicitantes no pueden reasignar ni cambiar prioridad de tickets');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Bloqueo pesimista de fila (FOR UPDATE) para serializar escrituras concurrentes
    const cur = await client.query('SELECT * FROM tickets WHERE id = $1 FOR UPDATE', [id]);
    if (cur.rows.length === 0) throw new AppError(404, 'Ticket no encontrado');
    const prev = cur.rows[0];

    // Control de concurrencia optimista (Detección de Lost Updates si otro usuario modificó el ticket en simultáneo)
    if (expected_updated_at) {
      const prevTime = new Date(prev.updated_at).getTime();
      const expectedTime = new Date(expected_updated_at).getTime();
      if (Math.abs(prevTime - expectedTime) > 1500) {
        throw new AppError(
          409,
          'El ticket ha sido modificado por otro usuario en simultáneo. Se han actualizado los datos para proteger la información.'
        );
      }
    }

    const updates = [];
    const params = [id];
    const historyEvents = [];

    if (status && status !== prev.status) {
      const validStatuses = ['nuevo', 'abierto', 'en_proceso', 'en_espera', 'resuelto', 'cerrado', 'cancelado'];
      if (!validStatuses.includes(status)) throw new AppError(400, 'Estado inválido');
      params.push(status);
      updates.push(`status = $${params.length}`);

      if (status === 'resuelto' && prev.status !== 'resuelto') {
        updates.push('resolution_date = NOW()');
      } else if (status === 'abierto' && prev.status === 'resuelto') {
        updates.push('resolution_date = NULL');
      }

      historyEvents.push({
        type: 'cambio_estado',
        desc: `Estado cambiado de "${prev.status}" a "${status}"`,
      });
    }

    if (priority && priority !== prev.priority) {
      const validPriorities = ['baja', 'media', 'alta', 'critica'];
      if (!validPriorities.includes(priority)) throw new AppError(400, 'Prioridad inválida');
      params.push(priority);
      updates.push(`priority = $${params.length}`);
      historyEvents.push({
        type: 'cambio_prioridad',
        desc: `Prioridad cambiada de "${prev.priority}" a "${priority}"`,
      });
    }

    if (assigned_to !== undefined && assigned_to !== prev.assigned_to) {
      params.push(assigned_to ? Number(assigned_to) : null);
      updates.push(`assigned_to = $${params.length}`);
      historyEvents.push({
        type: 'asignacion',
        desc: assigned_to ? `Reasignado a nuevo responsable` : `Desasignado del responsable anterior`,
      });

      // Notificar al nuevo responsable asignado
      if (assigned_to && Number(assigned_to) !== user.id) {
        await client.query(
          `INSERT INTO notifications (user_id, ticket_id, title, message)
           VALUES ($1, $2, 'Ticket Asignado', $3)`,
          [Number(assigned_to), id, `Se te ha asignado el ticket ${prev.folio}: "${prev.title}"`]
        );
      }
    }

    if (target_department_id && target_department_id !== prev.target_department_id) {
      params.push(Number(target_department_id));
      updates.push(`target_department_id = $${params.length}`);
      historyEvents.push({
        type: 'reasignacion_depto',
        desc: `Transferido a otro departamento`,
      });
    }

    if (due_date !== undefined) {
      params.push(due_date || null);
      updates.push(`due_date = $${params.length}`);
    }

    if (updates.length > 0) {
      updates.push('updated_at = NOW()');
      await client.query(`UPDATE tickets SET ${updates.join(', ')} WHERE id = $1`, params);

      for (const h of historyEvents) {
        await client.query(
          `INSERT INTO ticket_history (ticket_id, user_id, event_type, description)
           VALUES ($1, $2, $3, $4)`,
          [id, user.id, h.type, h.desc]
        );
      }

      // Notificar al solicitante
      if (prev.requester_id !== user.id) {
        await client.query(
          `INSERT INTO notifications (user_id, ticket_id, title, message)
           VALUES ($1, $2, 'Actualización de Ticket', $3)`,
          [prev.requester_id, id, `Tu ticket ${prev.folio} ha sido actualizado: ${historyEvents.map(e => e.desc).join(', ')}`]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ message: 'Ticket actualizado correctamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

// Agregar comentario o nota interna con validación concurrente de estado
const addComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const { content, is_internal = false } = req.body;

  if (!content || !content.trim()) {
    throw new AppError(400, 'El contenido del comentario no puede estar vacío');
  }

  // Solicitante nunca puede crear nota interna
  const internalFlag = user.role === 'requester' ? false : Boolean(is_internal);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const ticketRes = await client.query('SELECT * FROM tickets WHERE id = $1 FOR UPDATE', [id]);
    if (ticketRes.rows.length === 0) throw new AppError(404, 'Ticket no encontrado');
    const ticket = ticketRes.rows[0];

    if (ticket.status === 'cerrado' || ticket.status === 'cancelado') {
      throw new AppError(403, 'No es posible agregar comentarios a un ticket cerrado o cancelado.');
    }

    const commentRes = await client.query(
      `INSERT INTO ticket_comments (ticket_id, user_id, content, is_internal)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [id, user.id, content.trim(), internalFlag]
    );

    // Registro en historial
    await client.query(
      `INSERT INTO ticket_history (ticket_id, user_id, event_type, description)
       VALUES ($1, $2, 'comentario', $3)`,
      [id, user.id, internalFlag ? 'Agregó una nota interna de soporte' : 'Publicó un comentario de seguimiento']
    );

    // Notificaciones: si no es nota interna, notificar a la otra parte
    if (!internalFlag) {
      const recipientId = user.id === ticket.requester_id ? ticket.assigned_to : ticket.requester_id;
      if (recipientId) {
        await client.query(
          `INSERT INTO notifications (user_id, ticket_id, title, message)
           VALUES ($1, $2, 'Nuevo mensaje en ticket', $3)`,
          [recipientId, id, `${user.full_name} comentó en el ticket ${ticket.folio}`]
        );
      }
    }

    await client.query('COMMIT');
    res.status(201).json({
      comment: {
        ...commentRes.rows[0],
        user_name: user.full_name,
        user_role: user.role,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

// Resolver ticket con control de concurrencia
const resolveTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const { solution } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const ticketRes = await client.query('SELECT * FROM tickets WHERE id = $1 FOR UPDATE', [id]);
    if (ticketRes.rows.length === 0) throw new AppError(404, 'Ticket no encontrado');
    const ticket = ticketRes.rows[0];

    if (['resuelto', 'cerrado', 'cancelado'].includes(ticket.status)) {
      throw new AppError(409, `El ticket ya se encuentra ${ticket.status}.`);
    }

    await client.query(
      `UPDATE tickets
       SET status = 'resuelto', resolution_date = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [id]
    );

    if (solution && solution.trim()) {
      await client.query(
        `INSERT INTO ticket_comments (ticket_id, user_id, content, is_internal)
         VALUES ($1, $2, $3, false)`,
        [id, user.id, `Resolución técnica: ${solution.trim()}`]
      );
    }

    await client.query(
      `INSERT INTO ticket_history (ticket_id, user_id, event_type, description)
       VALUES ($1, $2, 'resolucion', 'Ticket marcado como resuelto')`,
      [id, user.id]
    );

    await client.query(
      `INSERT INTO notifications (user_id, ticket_id, title, message)
       VALUES ($1, $2, 'Ticket Resuelto', $3)`,
      [ticket.requester_id, id, `Tu ticket ${ticket.folio} ha sido resuelto. Por favor confirma la solución.`]
    );

    await client.query('COMMIT');
    res.json({ message: 'Ticket marcado como resuelto correctamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

// Cerrar ticket (confirmación final) transaccional con bloqueo
const closeTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const cur = await client.query('SELECT * FROM tickets WHERE id = $1 FOR UPDATE', [id]);
    if (cur.rows.length === 0) throw new AppError(404, 'Ticket no encontrado');
    const ticket = cur.rows[0];

    if (ticket.status === 'cerrado') {
      throw new AppError(409, 'El ticket ya se encuentra formalmente cerrado.');
    }

    await client.query(
      `UPDATE tickets SET status = 'cerrado', updated_at = NOW() WHERE id = $1`,
      [id]
    );

    await client.query(
      `INSERT INTO ticket_history (ticket_id, user_id, event_type, description)
       VALUES ($1, $2, 'cierre', 'Ticket cerrado y archivado formalmente')`,
      [id, user.id]
    );

    // Notificar al responsable si lo cierra el solicitante
    if (ticket.assigned_to && ticket.assigned_to !== user.id) {
      await client.query(
        `INSERT INTO notifications (user_id, ticket_id, title, message)
         VALUES ($1, $2, 'Ticket Cerrado', $3)`,
        [ticket.assigned_to, id, `El ticket ${ticket.folio} ha sido cerrado definitivamente.`]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Ticket cerrado exitosamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

// Reabrir ticket con control de concurrencia
const reopenTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = req.user;
  const { reason = 'Sin motivo especificado' } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const cur = await client.query('SELECT * FROM tickets WHERE id = $1 FOR UPDATE', [id]);
    if (cur.rows.length === 0) throw new AppError(404, 'Ticket no encontrado');
    const ticket = cur.rows[0];

    if (!['resuelto', 'cerrado'].includes(ticket.status)) {
      throw new AppError(409, `No se puede reabrir un ticket con estado "${ticket.status}".`);
    }

    await client.query(
      `UPDATE tickets
       SET status = 'abierto', resolution_date = NULL, updated_at = NOW()
       WHERE id = $1`,
      [id]
    );

    await client.query(
      `INSERT INTO ticket_comments (ticket_id, user_id, content, is_internal)
       VALUES ($1, $2, $3, false)`,
      [id, user.id, `Reapertura de ticket solicitada: ${reason}`]
    );

    await client.query(
      `INSERT INTO ticket_history (ticket_id, user_id, event_type, description)
       VALUES ($1, $2, 'reapertura', $3)`,
      [id, user.id, `Ticket reabierto. Motivo: ${reason}`]
    );

    if (ticket.assigned_to) {
      await client.query(
        `INSERT INTO notifications (user_id, ticket_id, title, message)
         VALUES ($1, $2, 'Ticket Reabierto', $3)`,
        [ticket.assigned_to, id, `El ticket ${ticket.folio} ha sido reabierto por el solicitante`]
      );
    }

    await client.query('COMMIT');
    res.json({ message: 'Ticket reabierto correctamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
});

module.exports = {
  listTickets,
  getTicketById,
  createTicket,
  updateTicket,
  addComment,
  resolveTicket,
  closeTicket,
  reopenTicket,
};
