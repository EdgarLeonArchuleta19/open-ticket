-- ============================================================
--  QuickTicket - Sistema Empresarial de Gestión de Tickets
--  Esquema Relacional Normalizado + Datos Semilla
-- ============================================================

DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS ticket_comments CASCADE;
DROP TABLE IF EXISTS ticket_history CASCADE;
DROP TABLE IF EXISTS tickets CASCADE;
DROP TABLE IF EXISTS causes CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

-- Secuencia para folios legibles TKT-000001
DROP SEQUENCE IF EXISTS ticket_folio_seq;
CREATE SEQUENCE ticket_folio_seq START WITH 1;

-- ------------------------------------------------------------
-- 1. Departamentos
-- ------------------------------------------------------------
CREATE TABLE departments (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  manager_id INT, -- Referencia diferida a users
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 2. Categorías
-- ------------------------------------------------------------
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 3. Causas (asociadas a una categoría)
-- ------------------------------------------------------------
CREATE TABLE causes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  default_priority VARCHAR(20) NOT NULL DEFAULT 'media',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 4. Usuarios
-- ------------------------------------------------------------
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'agent', 'requester')),
  department_id INT REFERENCES departments(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clave foránea de manager_id en departments
ALTER TABLE departments
  ADD CONSTRAINT fk_department_manager
  FOREIGN KEY (manager_id) REFERENCES users(id) ON DELETE SET NULL;

-- ------------------------------------------------------------
-- 5. Tickets
-- ------------------------------------------------------------
CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  folio VARCHAR(30) UNIQUE NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  requester_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  requesting_department_id INT REFERENCES departments(id) ON DELETE RESTRICT,
  target_department_id INT NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  cause_id INT NOT NULL REFERENCES causes(id) ON DELETE RESTRICT,
  priority VARCHAR(20) NOT NULL DEFAULT 'media' CHECK (priority IN ('baja', 'media', 'alta', 'critica')),
  status VARCHAR(20) NOT NULL DEFAULT 'nuevo' CHECK (status IN ('nuevo', 'abierto', 'en_proceso', 'en_espera', 'resuelto', 'cerrado', 'cancelado')),
  assigned_to INT REFERENCES users(id) ON DELETE SET NULL,
  due_date TIMESTAMP,
  resolution_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas frecuentes
CREATE INDEX idx_tickets_folio ON tickets(folio);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_priority ON tickets(priority);
CREATE INDEX idx_tickets_requester ON tickets(requester_id);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_tickets_target_dept ON tickets(target_department_id);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);

-- ------------------------------------------------------------
-- 6. Comentarios de Tickets (distingue notas internas)
-- ------------------------------------------------------------
CREATE TABLE ticket_comments (
  id SERIAL PRIMARY KEY,
  ticket_id INT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- True: solo visible para admin y agente
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);

-- ------------------------------------------------------------
-- 7. Historial de Auditoría / Línea de Tiempo
-- ------------------------------------------------------------
CREATE TABLE ticket_history (
  id SERIAL PRIMARY KEY,
  ticket_id INT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  event_type VARCHAR(50) NOT NULL, -- 'creacion', 'cambio_estado', 'cambio_prioridad', 'asignacion', 'comentario', 'resolucion', 'cierre', 'reapertura'
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ticket_history_ticket_id ON ticket_history(ticket_id);

-- ------------------------------------------------------------
-- 8. Notificaciones Internas
-- ------------------------------------------------------------
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ticket_id INT REFERENCES tickets(id) ON DELETE SET NULL,
  title VARCHAR(150) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id, is_read);

-- ------------------------------------------------------------
-- Datos Iniciales / Semilla
-- ------------------------------------------------------------

-- Departamentos iniciales
INSERT INTO departments (code, name, description, is_active) VALUES
('TI-SUP', 'Soporte y Sistemas TI', 'Mesa de ayuda, estaciones de trabajo y herramientas tecnológicas', true),
('INFRA', 'Infraestructura & Redes', 'Servidores, enlaces de datos, conectividad y telefonía', true),
('DES-SOFT', 'Desarrollo de Software', 'Aplicaciones empresariales internas, APIs y reportes', true),
('SEG-INF', 'Seguridad de la Información', 'Gestión de identidades, accesos, permisos y auditoría', true),
('OPERAC', 'Operaciones y Logística', 'Servicios generales, equipamiento físico y almacén', true),
('RRHH', 'Recursos Humanos', 'Altas, bajas de personal, nómina y capacitaciones', true);

-- Categorías
INSERT INTO categories (code, name, description, is_active) VALUES
('CAT-SOP', 'Soporte Técnico', 'Atención directa a fallas en equipos y programas de usuario', true),
('CAT-SIS', 'Sistemas y Aplicativos', 'Incidencias con ERP, CRM o software empresarial', true),
('CAT-INF', 'Infraestructura y Redes', 'Problemas de red, Wi-Fi, servidores y telefonía', true),
('CAT-ACC', 'Accesos y Permisos', 'Gestión de cuentas, reseteo de claves y permisos', true),
('CAT-MNT', 'Mantenimiento y Hardware', 'Reparación, cambio o revisión de equipo físico', true);

-- Causas por Categoría
INSERT INTO causes (code, name, description, category_id, is_active) VALUES
-- Soporte Técnico (1)
('CS-001', 'Equipo no enciende o reinicia', 'Falla eléctrica o apagados súbitos de la estación de trabajo', 1, true),
('CS-002', 'Lentitud extrema en equipo', 'Problemas de rendimiento de memoria o procesador', 1, true),
('CS-003', 'Falla de periféricos o monitor', 'Problemas con mouse, teclado, monitor o escáner', 1, true),
('CS-004', 'Falla de impresora o tóner', 'Impresora sin conexión, atascada o sin consumibles', 1, true),

-- Sistemas y Aplicativos (2)
('CS-005', 'Error al procesar en aplicación', 'La aplicación muestra código de error o bloqueo de pantalla', 2, true),
('CS-006', 'Instalación o actualización requerida', 'Solicitud para desplegar nueva versión o paquete de software', 2, true),
('CS-007', 'Inconsistencia en reporte de datos', 'Datos erróneos o desactualizados en tableros y reportes', 2, true),

-- Infraestructura y Redes (3)
('CS-008', 'Sin conexión a Internet o red local', 'Pérdida total de enlace de red en puesto o área', 3, true),
('CS-009', 'Falla de VPN corporativa', 'Imposibilidad de establecer conexión remota segura', 3, true),
('CS-010', 'Interrupción en telefonía VoIP', 'Llamadas entrecortadas, sin tono o caída de conmutador', 3, true),

-- Accesos y Permisos (4)
('CS-011', 'Contraseña bloqueada o expirada', 'Desbloqueo de cuenta de correo o dominio empresarial', 4, true),
('CS-012', 'Solicitud de alta de usuario nuevo', 'Creación de credenciales para colaborador de nuevo ingreso', 4, true),
('CS-013', 'Elevación de privilegios en carpeta', 'Acceso a repositorio compartido o base de datos', 4, true),

-- Mantenimiento y Hardware (5)
('CS-014', 'Mantenimiento preventivo programado', 'Limpieza física y verificación semestral de equipo', 5, true),
('CS-015', 'Reemplazo de batería o cargador', 'Degradación de batería o falla de fuente de poder', 5, true);
