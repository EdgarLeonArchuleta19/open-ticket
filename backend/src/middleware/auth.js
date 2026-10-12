const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new AppError(401, 'No autorizado: token faltante'));
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: payload.id,
      username: payload.username,
      tipo: payload.tipo,
      departamento_id: payload.departamento_id,
    };
    next();
  } catch (error) {
    next(new AppError(401, 'No autorizado: token inválido o expirado'));
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new AppError(401, 'No autorizado'));
    if (!roles.includes(req.user.tipo)) {
      return next(new AppError(403, 'No tiene permisos para realizar esta acción'));
    }
    next();
  };
}

module.exports = { authenticate, requireRole, JWT_SECRET };
