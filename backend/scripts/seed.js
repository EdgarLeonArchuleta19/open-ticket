/**
 * QuickTicket - Seed de Datos Iniciales
 * Crea usuarios, tickets de prueba, comentarios e historial con contraseñas hasheadas (bcrypt).
 */
const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

const SALT_ROUNDS = 10;

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Iniciando siembra de datos de QuickTicket...');
    await client.query('BEGIN');

    // 1. Usuarios
    const passAdmin = await bcrypt.hash('admin123', SALT_ROUNDS);
    const passAgent = await bcrypt.hash('agente123', SALT_ROUNDS);
    const passReq = await bcrypt.hash('solicita123', SALT_ROUNDS);

    const usersToInsert = [
      { username: 'admin', email: 'admin@quickticket.local', password: passAdmin, full_name: 'Alejandro Ramos', role: 'admin', dept_id: 1 },
      { username: 'agente.ti', email: 'carlos.soporte@quickticket.local', password: passAgent, full_name: 'Carlos Hernández (Soporte)', role: 'agent', dept_id: 1 },
      { username: 'agente.redes', email: 'elena.redes@quickticket.local', password: passAgent, full_name: 'Elena Vega (Redes)', role: 'agent', dept_id: 2 },
      { username: 'agente.seg', email: 'ricardo.seg@quickticket.local', password: passAgent, full_name: 'Ricardo Morales (Seguridad)', role: 'agent', dept_id: 4 },
      { username: 'solicitante1', email: 'mariana.lopez@empresa.com', password: passReq, full_name: 'Mariana López', role: 'requester', dept_id: 5 },
      { username: 'solicitante2', email: 'javier.ruiz@empresa.com', password: passReq, full_name: 'Javier Ruiz', role: 'requester', dept_id: 6 },
    ];

    const userMap = {};
    for (const u of usersToInsert) {
      const res = await client.query(
        `INSERT INTO users (username, email, password, full_name, role, department_id, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, true)
         ON CONFLICT (username) DO UPDATE
           SET email = EXCLUDED.email,
               password = EXCLUDED.password,
               full_name = EXCLUDED.full_name,
               role = EXCLUDED.role,
               department_id = EXCLUDED.department_id
         RETURNING id, username`,
        [u.username, u.email, u.password, u.full_name, u.role, u.dept_id]
      );
      userMap[u.username] = res.rows[0].id;
    }

    // Asignar managers a departamentos
    await client.query('UPDATE departments SET manager_id = $1 WHERE id = 1', [userMap['admin']]);
    await client.query('UPDATE departments SET manager_id = $1 WHERE id = 2', [userMap['agente.redes']]);

    // 2. Tickets de prueba iniciales con folios TKT-000001, etc.
    const ticketsSeed = [
      {
        folio: 'TKT-000001',
        title: 'Falla total en conexión de red en área de almacén',
        description: 'Desde las 9:00 AM se cayó la conexión de red cableada en la mesa de control de almacén. No se pueden imprimir etiquetas de embarque ni registrar salidas.',
        requester: userMap['solicitante1'],
        req_dept: 5,
        target_dept: 2,
        category: 3,
        cause: 8,
        priority: 'critica',
        status: 'en_proceso',
        assigned: userMap['agente.redes'],
      },
      {
        folio: 'TKT-000002',
        title: 'Equipo portátil no enciende tras descarga eléctrica',
        description: 'La laptop Dell Latitude asignada no da luces ni muestra señal de carga al conectar el cargador tras la tormenta eléctrica de ayer por la noche.',
        requester: userMap['solicitante2'],
        req_dept: 6,
        target_dept: 1,
        category: 1,
        cause: 1,
        priority: 'alta',
        status: 'abierto',
        assigned: userMap['agente.ti'],
      },
      {
        folio: 'TKT-000003',
        title: 'Solicitud de acceso a repositorio compartido de Nóminas',
        description: 'Se solicita permiso de lectura y edición para la carpeta compartida //servidor/recursos-humanos/nominas-2026 para el nuevo analista de compensaciones.',
        requester: userMap['solicitante2'],
        req_dept: 6,
        target_dept: 4,
        category: 4,
        cause: 13,
        priority: 'media',
        status: 'resuelto',
        assigned: userMap['agente.seg'],
        resolution_date: new Date(),
      },
      {
        folio: 'TKT-000004',
        title: 'Lentitud recurrente al generar facturación en el sistema',
        description: 'Al presionar "Generar CFDI" en la pantalla de pedidos, el navegador se congela por 40 segundos antes de emitir la confirmación.',
        requester: userMap['solicitante1'],
        req_dept: 5,
        target_dept: 3,
        category: 2,
        cause: 5,
        priority: 'media',
        status: 'nuevo',
        assigned: null,
      },
      {
        folio: 'TKT-000005',
        title: 'Mantenimiento preventivo anual de escáneres',
        description: 'Revisión y cambio de rodillos para los escáneres de digitalización documental.',
        requester: userMap['solicitante2'],
        req_dept: 6,
        target_dept: 1,
        category: 5,
        cause: 14,
        priority: 'baja',
        status: 'cerrado',
        assigned: userMap['agente.ti'],
        resolution_date: new Date(Date.now() - 86400000 * 3),
      }
    ];

    // Ajustar secuencia para que el siguiente ticket sea TKT-000006
    await client.query("SELECT setval('ticket_folio_seq', 5, true)");

    for (const t of ticketsSeed) {
      const resT = await client.query(
        `INSERT INTO tickets (folio, title, description, requester_id, requesting_department_id, target_department_id, category_id, cause_id, priority, status, assigned_to, resolution_date, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW() - INTERVAL '1 day', NOW())
         ON CONFLICT (folio) DO NOTHING
         RETURNING id`,
        [t.folio, t.title, t.description, t.requester, t.req_dept, t.target_dept, t.category, t.cause, t.priority, t.status, t.assigned, t.resolution_date || null]
      );

      if (resT.rows.length > 0) {
        const tId = resT.rows[0].id;

        // Historial inicial
        await client.query(
          `INSERT INTO ticket_history (ticket_id, user_id, event_type, description, metadata)
           VALUES ($1, $2, 'creacion', 'Ticket registrado con folio ' || $3, $4)`,
          [tId, t.requester, t.folio, JSON.stringify({ priority: t.priority, status: t.status })]
        );

        if (t.assigned) {
          await client.query(
            `INSERT INTO ticket_history (ticket_id, user_id, event_type, description)
             VALUES ($1, $2, 'asignacion', 'Ticket asignado al especialista')`,
            [tId, userMap['admin']]
          );
        }

        // Comentarios
        await client.query(
          `INSERT INTO ticket_comments (ticket_id, user_id, content, is_internal)
           VALUES ($1, $2, 'Hemos recibido el requerimiento y se está coordinando la revisión técnica.', false)`,
          [tId, t.assigned || userMap['admin']]
        );

        // Nota interna (solo para agentes/admin)
        await client.query(
          `INSERT INTO ticket_comments (ticket_id, user_id, content, is_internal)
           VALUES ($1, $2, 'Nota interna: Se verificó el switch de piso y tiene enlace intermitente en puerto 8.', true)`,
          [tId, userMap['agente.redes']]
        );
      }
    }

    // 3. Notificaciones de prueba
    await client.query(
      `INSERT INTO notifications (user_id, ticket_id, title, message, is_read)
       VALUES
       ($1, 1, 'Nuevo ticket asignado', 'Se te ha asignado el ticket TKT-000001 (Prioridad Crítica)', false),
       ($2, 3, 'Ticket Resuelto', 'Tu solicitud TKT-000003 ha sido resuelta por el equipo de seguridad', false)`,
      [userMap['agente.redes'], userMap['solicitante2']]
    );

    await client.query('COMMIT');
    console.log('¡Siembra de QuickTicket completada exitosamente!');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error durante la siembra:', error);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
