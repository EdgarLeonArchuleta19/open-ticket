function notFound(req, res, next) {
  res.status(404).json({ error: 'Recurso no encontrado' });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    console.error('Error no controlado:', err);
  }

  res.status(statusCode).json({
    error: statusCode >= 500 ? 'Error interno del servidor' : err.message,
  });
}

module.exports = { notFound, errorHandler };
