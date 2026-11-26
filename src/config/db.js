// Pool permite crear conexiones a PostgreSQL
const { Pool } = require('pg'); // Importar Pool del paquete "pg"
const https = require('node:https');
const { isIPv4 } = require('node:net');

function obtenerIPv4() {
  const ipv4Configurada = process.env.PUBLIC_IPV4?.trim();
  if (ipv4Configurada) {
    if (!isIPv4(ipv4Configurada)) {
      return Promise.reject(new Error('PUBLIC_IPV4 debe contener una dirección IPv4 válida.'));
    }
    return Promise.resolve(ipv4Configurada);
  }

  return new Promise((resolve, reject) => {
    const request = https.get('https://api4.ipify.org', { timeout: 5000 }, (response) => {
      if (response.statusCode !== 200) {
        response.resume();
        reject(new Error(`El servicio de detección respondió HTTP ${response.statusCode}.`));
        return;
      }

      response.setEncoding('utf8');
      let address = '';
      response.on('data', (chunk) => {
        address += chunk;
      });
      response.on('error', reject);
      response.on('end', () => {
        const ipv4 = address.trim();
        if (!isIPv4(ipv4)) {
          reject(new Error('El servicio de detección no devolvió una dirección IPv4 válida.'));
          return;
        }
        resolve(ipv4);
      });
    });

    request.on('timeout', () => request.destroy(new Error('Tiempo agotado al detectar la IPv4 pública.')));
    request.on('error', reject);
  });
}

// Crear instancia quea administra la DB
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.query('SELECT NOW()')
  .then(() => {
    console.log('\u3291 Conexión exitosa a PostgreSQL \u3291');
    obtenerIPv4()
      .then((ipv4) => {
        const port = process.env.PORT || 3000;
        console.log(`\u2FCB URL Documentacion: http://${ipv4}:${port}/api-docs/ \u2FCB\n`);
      })
      .catch((err) => {
        console.error('No se pudo determinar la IPv4 pública:', err.message);
      });
  })
  .catch((err) => console.error('Error al conectar a PostgreSQL:', err.message));

module.exports = pool;