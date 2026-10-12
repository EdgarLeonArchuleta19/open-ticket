const app = require('./src/app');
const pool = require('./src/config/db');

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Conectado a la base de datos PostgreSQL');
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error.message);
  }

  app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
  });
})();
