require('dotenv').config();
require('./src/config/db');
const app = require('./src/app');

const PORT = process.env.PORT || 3000;
const API_URL = `http://localhost:${PORT}/api/v1`;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\u2FBE API Express lista | Puerto: ${PORT} \u2FBE`);
  console.log(`\u2FCB Postman URL: ${API_URL} \u2FCB\n`);
});
