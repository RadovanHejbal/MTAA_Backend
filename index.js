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


//EXAMPLE /*
app.get('/login', (req, res) => {
  pool.query(`SELECT * FROM users WHERE username = '${req.body.username}' AND password = '${req.body.password}'`, (err, response) => {
    if(err) {
      res.send(err);
      return;
    }
    res.send(response?.rows[0]);
  })
})

app.get('/meals/:minimumcalorie', (req, res) => {
  pool.query(`SELECT * FROM meals WHERE ${req.params.minimumcalorie} < meals.kcal`, (err, response) => {
    if(err) {
      res.send(err);
      return;
    }
    res.send(response?.rows);
  })
})

// EXAMPLE */

app.listen(8000, () => {
  console.log("Listening on port: 8000");
});
