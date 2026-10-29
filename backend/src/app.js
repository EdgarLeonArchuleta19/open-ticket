const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

const corsOrigins = (process.env.CORS_ORIGIN || 'http://localhost:8080,http://127.0.0.1:8080,http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim());

app.use(
  helmet({
    contentSecurityPolicy: false, // Permite cargar scripts CDN y recursos de Tailwind/Lucide
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Límite de intentos de inicio de sesión (fuerza bruta)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiados intentos de inicio de sesión. Intente más tarde.' },
});
app.use('/api/auth/login', loginLimiter);

// Límite general de peticiones API (protección DDoS y abuso de recursos)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Límite de solicitudes superado. Por favor, espere unos minutos.' },
});
app.use('/api', apiLimiter);

// Rutas de API REST
app.use('/api', routes);

// ============================================================
// Alojar el Frontend compilado dentro del Backend
// Permite que al levantar el backend (puerto 3000), también
// se sirva la interfaz de usuario completa de QuickTicket
// ============================================================
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

// Fallback SPA para cualquier ruta del frontend que no sea /api
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  const indexPath = path.join(frontendDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // Si aún no se ha compilado frontend/dist, dar mensaje útil
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head><title>OpenTicket API</title><meta charset="utf-8"></head>
        <body style="font-family: sans-serif; padding: 40px; text-align: center;">
          <h2>OpenTicket API en ejecución</h2>
          <p>Para ver la interfaz gráfica en este puerto, ejecute <code>npm run build</code> en la carpeta <code>frontend</code>.</p>
        </body>
        </html>
      `);
    }
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
