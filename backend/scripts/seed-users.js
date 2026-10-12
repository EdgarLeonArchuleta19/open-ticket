/**
 * Siembra los usuarios de prueba con contraseñas hasheadas (bcrypt).
 * Es idempotente: si el usuario ya existe actualiza sus datos.
 *
 * Uso:  npm run seed
 */
const bcrypt = require('bcryptjs');
const pool = require('../src/config/db');

const SALT_ROUNDS = 10;

const usuarios = [
  { username: 'admin', password: 'admin123', nombre: 'Administrador General', tipo: 'administrador', departamento_id: null },

  { username: 'tecnico_cambios', password: 'cambio123', nombre: 'Técnico de Cambios', tipo: 'tecnico', departamento_id: 1 },
  { username: 'tecnico_config', password: 'config123', nombre: 'Técnico de Configuraciones', tipo: 'tecnico', departamento_id: 2 },
  { username: 'tecnico_incidencias', password: 'incidencias123', nombre: 'Técnico de Incidencias', tipo: 'tecnico', departamento_id: 3 },
  { username: 'tecnico_problemas', password: 'problemas123', nombre: 'Técnico de Problemas', tipo: 'tecnico', departamento_id: 4 },
  { username: 'tecnico_hardware', password: 'hardware123', nombre: 'Técnico de Hardware', tipo: 'tecnico', departamento_id: 5 },
  { username: 'tecnico_soporte', password: 'soporte123', nombre: 'Técnico de Soporte Técnico', tipo: 'tecnico', departamento_id: 6 },
  { username: 'tecnico_redes', password: 'redes123', nombre: 'Técnico de Redes', tipo: 'tecnico', departamento_id: 7 },
  { username: 'tecnico_seguridad', password: 'seguridad123', nombre: 'Técnico de Seguridad', tipo: 'tecnico', departamento_id: 8 },

  { username: 'usuario1', password: 'usuario123', nombre: 'Juan Pérez', tipo: 'usuarioNormal', departamento_id: null },
  { username: 'usuario2', password: 'usuario456', nombre: 'Ana García', tipo: 'usuarioNormal', departamento_id: null },
  { username: 'usuario3', password: 'usuario789', nombre: 'Luis Martínez', tipo: 'usuarioNormal', departamento_id: null },
];

(async () => {
  try {
    for (const usuario of usuarios) {
      const hash = await bcrypt.hash(usuario.password, SALT_ROUNDS);
      await pool.query(
        `INSERT INTO usuarios (username, password, nombre, tipo, departamento_id)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (username) DO UPDATE
           SET password = EXCLUDED.password,
               nombre = EXCLUDED.nombre,
               tipo = EXCLUDED.tipo,
               departamento_id = EXCLUDED.departamento_id`,
        [usuario.username, hash, usuario.nombre, usuario.tipo, usuario.departamento_id]
      );
    }
    console.log(`Usuarios sembrados correctamente: ${usuarios.length}`);
  } catch (error) {
    console.error('Error al sembrar usuarios:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
