const express = require("express");
const app = express();
const { Client } = require("pg");

const pool = new Client({
  user: process.env.DATABASE_USER || 'postgres',
  host: process.env.DATABASE_HOST || '127.0.0.1',
  port: process.env.DATABASE_PORT || 5432,
  database: process.env.DATABASE_NAME || 'mtaa',
  password: process.env.DATABASE_PASSWORD || 'password'
});

pool.connect();

app.listen(8000, () => {
  console.log("Listening on port: 8000");
});
