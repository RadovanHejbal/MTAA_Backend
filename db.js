const {Client} = require('pg');

const pool = new Client({
    user: /*process.env.DATABASE_USER ||*/ 'postgres',
    host: /*process.env.DATABASE_HOST ||*/ '127.0.0.1',
    port: /*process.env.DATABASE_PORT ||*/ 5432,
    database: /*process.env.DATABASE_NAME ||*/ 'mtaa',
    password: /*process.env.DATABASE_PASSWORD ||*/ 'j4r0sl4v'
  });
  pool.connect();

  module.exports = {
    pool,
  }