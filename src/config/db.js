const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.query('SELECT NOW()')
  .then(() => console.log('\u3291 Conexión exitosa a PostgreSQL \u3291'))
  .catch((err) => console.error('Error al conectar a PostgreSQL:', err.message));

module.exports = pool;