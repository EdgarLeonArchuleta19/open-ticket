const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const AppError = require('../utils/AppError');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

async function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new AppError(401, 'No autorizado: sesión requerida'));
  }

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return next(new AppError(401, 'No autorizado: token inválido o expirado'));
  }

  try {
    // Verificación en tiempo real contra la base de datos:
    // Garantiza que si el usuario fue desactivado, eliminado o su rol fue modificado,
    // la sesión se actualice o invalide de inmediato sin esperar la expiración del token.
    const { rows } = await pool.query(
      `SELECT u.id, u.username, u.email, u.full_name, u.role, u.department_id, u.is_active,
              d.name AS department_name
       FROM users u
       LEFT JOIN departments d ON u.department_id = d.id
       WHERE u.id = $1`,
      [payload.id]
    );

    if (rows.length === 0) {
      return next(new AppError(401, 'Usuario no encontrado o dado de baja'));
    }

    const user = rows[0];
    if (!user.is_active) {
      return next(new AppError(403, 'Su cuenta ha sido desactivada. Comuníquese con el administrador.'));
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      full_name: user.full_name,
      role: user.role, // 'admin' | 'agent' | 'requester'
      department_id: user.department_id,
      department_name: user.department_name,
    };
    next();
  } catch (err) {
    next(err);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new AppError(401, 'No autorizado'));
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, 'Acceso denegado: permisos insuficientes para esta operación'));
    }
    next();
  };
}

module.exports = { authenticate, requireRole, JWT_SECRET };
