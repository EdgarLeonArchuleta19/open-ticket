const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const getDashboardStats = asyncHandler(async (req, res) => {
  const user = req.user;
  let filterClause = '';
  const filterParams = [];

  if (user.role === 'requester') {
    filterClause = 'WHERE t.requester_id = $1';
    filterParams.push(user.id);
  } else if (user.role === 'agent') {
    filterClause = 'WHERE (t.assigned_to = $1 OR t.target_department_id = $2)';
    filterParams.push(user.id, user.department_id || 0);
  }

  // 1. Contadores principales
  const countsQuery = `
    SELECT
      COUNT(*)::int AS total,
      COUNT(CASE WHEN t.status = 'nuevo' THEN 1 END)::int AS nuevos,
      COUNT(CASE WHEN t.status = 'abierto' THEN 1 END)::int AS abiertos,
      COUNT(CASE WHEN t.status = 'en_proceso' THEN 1 END)::int AS en_proceso,
      COUNT(CASE WHEN t.status = 'en_espera' THEN 1 END)::int AS en_espera,
      COUNT(CASE WHEN t.status = 'resuelto' THEN 1 END)::int AS resueltos,
      COUNT(CASE WHEN t.status = 'cerrado' THEN 1 END)::int AS cerrados,
      COUNT(CASE WHEN t.status = 'cancelado' THEN 1 END)::int AS cancelados,
      COUNT(CASE WHEN t.priority = 'critica' AND t.status NOT IN ('resuelto', 'cerrado', 'cancelado') THEN 1 END)::int AS criticos_activos,
      COUNT(CASE WHEN t.due_date IS NOT NULL AND t.due_date < NOW() AND t.status NOT IN ('resuelto', 'cerrado', 'cancelado') THEN 1 END)::int AS vencidos
    FROM tickets t
    ${filterClause}
  `;

  // 2. Tickets por estado
  const byStatusQuery = `
    SELECT t.status, COUNT(*)::int AS count
    FROM tickets t
    ${filterClause}
    GROUP BY t.status
  `;

  // 3. Tickets por departamento destino
  const byDeptQuery = `
    SELECT d.name AS department_name, d.code AS department_code, COUNT(t.id)::int AS count
    FROM departments d
    LEFT JOIN tickets t ON t.target_department_id = d.id ${user.role === 'requester' ? 'AND t.requester_id = ' + user.id : ''}
    WHERE d.is_active = true
    GROUP BY d.id, d.name, d.code
    ORDER BY count DESC
  `;

  // 4. Tickets por prioridad
  const byPriorityQuery = `
    SELECT t.priority, COUNT(*)::int AS count
    FROM tickets t
    ${filterClause}
    GROUP BY t.priority
  `;

  // 5. Tickets recientes
  const recentTicketsQuery = `
    SELECT t.id, t.folio, t.title, t.priority, t.status, t.created_at,
           u.full_name AS requester_name,
           d.name AS target_department,
           ag.full_name AS assigned_to_name
    FROM tickets t
    JOIN users u ON t.requester_id = u.id
    JOIN departments d ON t.target_department_id = d.id
    LEFT JOIN users ag ON t.assigned_to = ag.id
    ${filterClause}
    ORDER BY t.created_at DESC
    LIMIT 6
  `;

  // 6. Actividad reciente
  const recentActivityQuery = `
    SELECT h.id, h.event_type, h.description, h.created_at,
           t.folio AS ticket_folio, t.title AS ticket_title,
           u.full_name AS user_name, u.role AS user_role
    FROM ticket_history h
    JOIN tickets t ON h.ticket_id = t.id
    LEFT JOIN users u ON h.user_id = u.id
    ${filterClause}
    ORDER BY h.created_at DESC
    LIMIT 8
  `;

  // 7. Tendencia de creación de tickets últimos 7 días
  const trendFilter = filterClause ? 'AND ' + filterClause.replace('WHERE ', '') : '';
  const trendQuery = `
    SELECT
      TO_CHAR(d.day, 'DD/MM') AS label,
      TO_CHAR(d.day, 'YYYY-MM-DD') AS date,
      COUNT(t.id)::int AS count
    FROM generate_series(CURRENT_DATE - INTERVAL '6 days', CURRENT_DATE, '1 day'::interval) d(day)
    LEFT JOIN tickets t ON DATE(t.created_at) = DATE(d.day) ${trendFilter}
    GROUP BY d.day
    ORDER BY d.day ASC
  `;

  const [countsRes, byStatusRes, byDeptRes, byPriorityRes, recentTicketsRes, recentActivityRes, trendRes] = await Promise.all([
    pool.query(countsQuery, filterParams),
    pool.query(byStatusQuery, filterParams),
    pool.query(byDeptQuery),
    pool.query(byPriorityQuery, filterParams),
    pool.query(recentTicketsQuery, filterParams),
    pool.query(recentActivityQuery, filterParams),
    pool.query(trendQuery, filterParams),
  ]);

  res.json({
    counts: countsRes.rows[0] || {},
    by_status: byStatusRes.rows,
    by_department: byDeptRes.rows,
    by_priority: byPriorityRes.rows,
    recent_tickets: recentTicketsRes.rows,
    recent_activity: recentActivityRes.rows,
    trend: trendRes.rows,
  });
});

module.exports = { getDashboardStats };
