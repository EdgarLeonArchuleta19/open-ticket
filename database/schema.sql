-- ============================================================
--  Sistema Gestor de Reportes - Telmex
--  Esquema de base de datos + datos base (departamentos y temas)
--
--  Uso:
--    createdb telmex
--    psql -d telmex -f database/schema.sql
--  Luego, sembrar usuarios con contraseñas hasheadas:
--    cd backend && npm run seed
-- ============================================================

-- ------------------------------------------------------------
-- Tablas
-- ------------------------------------------------------------

CREATE TABLE departamentos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT
);

CREATE TABLE temas_departamento (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  departamento_id INT REFERENCES departamentos(id) ON DELETE CASCADE
);

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(100),
  tipo VARCHAR(20) CHECK (tipo IN ('administrador', 'tecnico', 'usuarioNormal')),
  departamento_id INT REFERENCES departamentos(id)
);

CREATE TABLE problemas (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  estado VARCHAR(50) DEFAULT 'Abierto', -- Abierto, En Análisis, Resuelto
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tecnico_asignado INTEGER REFERENCES usuarios(id),
  solucion TEXT
);

CREATE TABLE tickets (
  id SERIAL PRIMARY KEY,
  usuario_id INT REFERENCES usuarios(id),
  tecnico_id INT REFERENCES usuarios(id),
  departamento_id INT REFERENCES departamentos(id),
  tema_id INT REFERENCES temas_departamento(id),
  descripcion TEXT NOT NULL,
  prioridad VARCHAR(20) CHECK (prioridad IN ('baja', 'media', 'alta')),
  estado VARCHAR(20) CHECK (estado IN ('abierto', 'en proceso', 'resuelto', 'cerrado')),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_cierre TIMESTAMP,
  problema_id INT REFERENCES problemas(id)
);

CREATE TABLE historial_tickets (
  id SERIAL PRIMARY KEY,
  ticket_id INT REFERENCES tickets(id) ON DELETE CASCADE,
  tecnico_id INT REFERENCES usuarios(id),
  cambio TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- Función: crea un problema y vincula/actualiza los tickets
-- ------------------------------------------------------------

CREATE OR REPLACE FUNCTION crear_problema_y_actualizar_tickets(
    p_titulo VARCHAR(255),
    p_descripcion TEXT,
    p_tickets_ids INT[]
) RETURNS INT AS $$
DECLARE
    v_problema_id INT;
    v_tecnico_problemas_id INT;
    v_ticket_record RECORD;
BEGIN
    SELECT id INTO v_tecnico_problemas_id
    FROM usuarios
    WHERE username = 'tecnico_problemas'
    LIMIT 1;

    IF v_tecnico_problemas_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró el técnico de problemas';
    END IF;

    INSERT INTO problemas (titulo, descripcion, estado, tecnico_asignado)
    VALUES (p_titulo, p_descripcion, 'Abierto', v_tecnico_problemas_id)
    RETURNING id INTO v_problema_id;

    UPDATE tickets
    SET problema_id = v_problema_id,
        estado = 'en proceso'
    WHERE id = ANY(p_tickets_ids);

    FOR v_ticket_record IN
        SELECT id, tecnico_id FROM tickets WHERE id = ANY(p_tickets_ids)
    LOOP
        INSERT INTO historial_tickets (ticket_id, tecnico_id, cambio)
        VALUES (
            v_ticket_record.id,
            v_ticket_record.tecnico_id,
            'Ticket vinculado al problema general #' || v_problema_id || ': ' || p_titulo ||
            '. El caso ha sido escalado a gestión de problemas.'
        );
    END LOOP;

    RETURN v_problema_id;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------
-- Datos base: departamentos
-- ------------------------------------------------------------

INSERT INTO departamentos (nombre, descripcion)
VALUES
('Cambios', 'Gestión de cambios en infraestructura y servicios'),
('Configuraciones', 'Gestión y configuración de dispositivos y servicios de red'),
('Incidencias', 'Atención de fallas e incidencias reportadas por los usuarios'),
('Problemas', 'Gestión de problemas recurrentes derivados de incidencias'),
('Hardware', 'Gestión de dispositivos físicos, como módems y routers'),
('Soporte Técnico', 'Atención a usuarios con problemas técnicos generales'),
('Redes', 'Gestión y mantenimiento de la red de telecomunicaciones'),
('Seguridad', 'Supervisión y gestión de la seguridad de los sistemas y datos');

-- ------------------------------------------------------------
-- Datos base: temas por departamento
-- ------------------------------------------------------------

INSERT INTO temas_departamento (nombre, departamento_id)
VALUES
-- Cambios (1)
('Quiero hacer un cambio', 1),
('Aprobación de cambios', 1),
('Seguimiento de cambios', 1),

-- Configuraciones (2)
('Configuración de módem', 2),
('Cambio de contraseñas Wi-Fi', 2),
('Actualización de firmware', 2),

-- Incidencias (3)
('Internet lento', 3),
('Fallas intermitentes', 3),
('Sin conexión', 3),

-- Problemas (4)
('Falla recurrente en nodo', 4),
('Interrupciones frecuentes', 4),

-- Hardware (5)
('Módem dañado', 5),
('Falla en el cableado', 5),

-- Soporte Técnico (6)
('Problemas de software', 6),
('Asistencia remota', 6),

-- Redes (7)
('Interrupción en red local', 7),
('Mantenimiento de enlaces', 7),

-- Seguridad (8)
('Acceso no autorizado', 8),
('Actualización de políticas de seguridad', 8);
